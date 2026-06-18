
const buttons = document.querySelectorAll(".nav-btn");
const tabs = document.querySelectorAll(".tab-content");

buttons.forEach(button => {
    button.addEventListener("click", () => {

        buttons.forEach(btn =>
            btn.classList.remove("active")
        );

        tabs.forEach(tab =>
            tab.classList.remove("active")
        );

        button.classList.add("active");

        const targetTab =
            button.getAttribute("data-tab");

        document
            .getElementById(targetTab)
            .classList.add("active");
    });
});

const API_KEY = "AQ.Ab8RN6IXcMhogoGbJe8VLcfsCJUYzFFFmSE2NnyRpCSWTSRYHg";

const newsText =
    document.getElementById("news-text");

const resultBox =
    document.getElementById("result-box");

const verifyButton =
    document.getElementById("btn-verify");

const imageInput =
    document.getElementById("image-upload");

const fileName =
    document.getElementById("file-name");

const clearButton =
    document.getElementById("btn-clear");

let imagemSelecionada = null;


verifyButton.addEventListener(
    "click",
    verificarNoticia
);

if (clearButton) {

    clearButton.addEventListener(
        "click",
        limparFormulario
    );
}

imageInput.addEventListener(
    "change",
    selecionarImagem
);

function selecionarImagem(event) {

    imagemSelecionada =
        event.target.files[0];

    if (!fileName) return;

    if (imagemSelecionada) {

        fileName.textContent =
            "Imagem selecionada: " +
            imagemSelecionada.name;

    } else {

        fileName.textContent =
            "Nenhuma imagem selecionada.";
    }
}

function limparFormulario() {

    newsText.value = "";

    imageInput.value = "";

    imagemSelecionada = null;

    if (fileName) {

        fileName.textContent =
            "Nenhuma imagem selecionada.";
    }

    resultBox.innerHTML = `
        <p>
            <i class="fa-solid fa-circle-info"></i>
            O resultado da análise aparecerá aqui.
        </p>
    `;

    resultBox.classList.add("placeholder");
}

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {

            const base64 =
                reader.result.split(",")[1];

            resolve(base64);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

async function verificarNoticia() {

    const texto =
        newsText.value.trim();

    if (!texto && !imagemSelecionada) {

        alert(
            "Digite uma notícia ou selecione uma imagem."
        );

        return;
    }

    resultBox.classList.remove("placeholder");

    resultBox.innerHTML = `
        <p>
            <i class="fa-solid fa-spinner fa-spin"></i>
            Analisando informação...
        </p>
    `;

    try {

        const prompt = `
Você é um especialista em fact-checking.

Analise cuidadosamente o conteúdo enviado.

Retorne exatamente no formato:

VEREDITO:
(Verdadeiro, Falso ou Incerto)

CONFIANÇA:
(0 a 100%)

ANÁLISE:
(explicação detalhada)

RECOMENDAÇÃO:
(como confirmar a informação)

FONTES:
(fontes sugeridas)
`;

        let parts = [];

        if (texto) {

            parts.push({
                text: `${prompt}

CONTEÚDO PARA ANÁLISE:

${texto}`
            });
        }

        if (imagemSelecionada) {

            const imagemBase64 =
                await fileToBase64(
                    imagemSelecionada
                );

            parts.push({
                inline_data: {
                    mime_type:
                        imagemSelecionada.type,
                    data: imagemBase64
                }
            });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: parts
                        }
                    ]
                })
            }
        );

        const data =
            await response.json();

        console.log(data);

        if (data.error) {

            resultBox.innerHTML = `
                <strong>Erro:</strong><br>
                ${data.error.message}
            `;

            return;
        }

        const resposta =
            data.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text;

        if (!resposta) {

            resultBox.innerHTML = `
                Nenhuma resposta recebida da IA.
            `;

            return;
        }

        resultBox.innerHTML = `
            <pre style="
                white-space:pre-wrap;
                text-align:left;
                font-family:inherit;
            ">${resposta}</pre>
        `;

    } catch (erro) {

        console.error(erro);

        resultBox.innerHTML = `
            <strong>Erro ao consultar a API:</strong><br>
            ${erro.message}
        `;
    }
}