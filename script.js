const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const form = document.getElementById('image-form');
const resultBox = document.getElementById('resultBox');
const countResult = document.getElementById('countResult');

imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove('d-none');
        }
        reader.readAsDataURL(file);

        reader.onload = function (e) {
            preview.onload = function () {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = preview.naturalWidth;
                canvas.height = preview.naturalHeight;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.classList.remove('d-none');
            };

            preview.src = e.target.result;
            preview.classList.remove('d-none');
        }

    }
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    resultBox.classList.remove('d-none');
    countResult.textContent = 'Processando...';

    const file = imageInput.files[0];

    const loader = document.getElementById('loader');

    // Ao iniciar
    loader.classList.remove('d-none');
    countResult.textContent = '';

    // Após resposta ou erro
    loader.classList.add('d-none');


    fetch("https://desafioofideas24.cognitiveservices.azure.com/customvision/v3.0/Prediction/f33129f7-2508-4238-87aa-285c150df208/detect/iterations/Iteration1/image", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            "Prediction-Key": "8178f060d26140f1a5c751d15b6991c8"
        },
        body: file
    })
        .then(response => response.json())
        .then(data => {
            const predictions = data.predictions || [];

            // Filtro com probabilidade mínima
            const confidentPredictions = predictions.filter(p => p.probability >= 0.94);
            const total = confidentPredictions.length;

            if (total > 0) {
                countResult.textContent = `${total} item(ns) detectado(s) com alta confiança.`;
            } else {
                countResult.textContent = "Nenhum item detectado com confiança suficiente.";
            }

            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confidentPredictions.forEach(pred => {
                const x = pred.boundingBox.left * canvas.width;
                const y = pred.boundingBox.top * canvas.height;
                const width = pred.boundingBox.width * canvas.width;
                const height = pred.boundingBox.height * canvas.height;

                ctx.strokeStyle = 'lime';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                ctx.font = '16px Arial';
                ctx.fillStyle = 'lime';
                ctx.fillText(`${(pred.probability * 100).toFixed(1)}%`, x + 4, y + 18);
            });

        })
        .catch(error => {
            console.error("Erro ao chamar API:", error);
            countResult.textContent = "Erro ao processar a imagem.";
        });

    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => {
        imageInput.value = '';
        preview.src = '';
        preview.classList.add('d-none');
        resultBox.classList.add('d-none');
        loader.classList.add('d-none');
        countResult.textContent = '';
        canvas.classList.add('d-none');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});