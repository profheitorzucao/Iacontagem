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

    navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((error) => {
                console.error("Erro ao acessar a câmera:", error);
            });

    btnM.onclick = function() {
            modal.style.display = "flex";
            imageInput.value = '';
        }
    capturarButton.addEventListener('click', () => {
            // Definir o tamanho do canvas igual ao do vídeo
            preview.width = video.videoWidth;
            preview.height = video.videoHeight;
            // Desenhar o quadro atual do vídeo no canvas
            context.drawImage(video, 0, 0, preview.width, preview.height);
            modal.style.display = "none";
            preview.classList.remove("d-none");
            // Mostrar o canvas com a imagem
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
        if (!file)
        {    
             file =  await canvasToFile(preview);
             if(!file)
            { console.log('oi');
                return;
            }
        };

        try {
            const response = await fetch("https://desafioofideas24-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/f33129f7-2508-4238-87aa-285c150df208/detect/iterations/Iteration6/image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Prediction-Key": "febf3ab5334c4384812e99fa6bb28f0a"
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