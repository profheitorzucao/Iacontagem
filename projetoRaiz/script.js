document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("image-form");
    const imageInput = document.getElementById("imageInput");
    const preview = document.getElementById("preview");
    const resultBox = document.getElementById("resultBox");
    const countResult = document.getElementById("countResult");
    const modal = document.getElementById("myModal");
    const btnM = document.getElementById("openModalBtn");
    const capturarButton = document.getElementById("capturar");
    const context = preview.getContext('2d');
    const btnFechar = document.getElementById("fecharmodal");

    var streamAtual = null;

    function desativaCam() {
        if (streamAtual) {
            streamAtual.getTracks().forEach(track => track.stop());
            video.srcObject = null; 
            streamAtual = null;
        }
    }

    btnM.onclick = function () {
        modal.style.display = "flex";
        imageInput.value = '';
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                streamAtual = stream;
                video.srcObject = stream;
            })
            .catch((error) => {
                console.error("Erro ao acessar a câmera:", error);
            });
    }
    capturarButton.addEventListener('click', () => {
        preview.width = video.videoWidth;
        preview.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, preview.width, preview.height);
        modal.style.display = "none";
        preview.classList.remove("d-none");
        desativaCam();
    });
    btnFechar.addEventListener('click', () => {
        modal.style.display = "none";
        desativaCam();
    });
    // Pré-visualização da imagem
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = preview;
                    const ctx = canvas.getContext("2d");

                    // Redimensiona o canvas para o tamanho da imagem (ou defina um fixo)
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.clearRect(0, 0, canvas.width, canvas.height); // limpa antes
                    ctx.drawImage(img, 0, 0);

                    canvas.classList.remove("d-none"); // mostra o canvas
                };

                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Envio da imagem
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        var file = imageInput.files[0];
        if (!file) {
            file = await canvasToFile(preview);
            if (!file) {
                console.log('oi');
                return;
            }
        };

        try {
            const response = await fetch("https://customvisioncontagemia-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/f9b7d2d7-ef89-4ed5-8cad-a260bae7d54c/detect/iterations/Root/image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Prediction-Key": "FLfkDHJ5xEcxmjL1saR6cg8IaeZgZcnGoZhE7S79gS6b0xpLpSDCJQQJ99BFACYeBjFXJ3w3AAAIACOGBrHc"
                },
                body: file
            });

            const data = await response.json();
            const predictions = data.predictions || [];
            const confidentPredictions = predictions.filter(p => p.probability >= 0.50);
            const total = confidentPredictions.length;

            resultBox.classList.remove("d-none");
            console.log(total);
            if (total > 0) {
                countResult.textContent = `${total} item(ns) detectado(s) com alta confiança.`;
            } else {
                countResult.textContent = "Nenhum item detectado com confiança suficiente.";
            }
        } catch (error) {
            console.error("Erro ao chamar API:", error);
            resultBox.classList.remove("d-none");
            countResult.textContent = "Erro ao processar a imagem.";
        }
    });
});

function canvasToFile(canvas) {
    return new Promise(resolve => {
        canvas.toBlob(blob => {
            const file = new File([blob], 'captura.png', { type: 'image/png' });
            resolve(file);
        }, 'image/png');
    });
}