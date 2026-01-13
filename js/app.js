// app.js corregido

$(document).ready(function() {
    const scriptURL = 'TU_URL_DE_GOOGLE';
    const $form = $('#formInscripcion');

    $form.on('submit', function(e) {
        e.preventDefault();

        // 🕵️‍♂️ Mi trampa para bots:
        // Reviso si el campo "trampa_bot" tiene algo escrito
        const botCheck = $('input[name="trampa_bot"]').val();
        
        if (botCheck !== "") {
            console.log("¡Caché a un bot! No voy a mandar nada.");
            return false; // Corto el proceso aquí mismo
        }

        // Si el campo está vacío, significa que es un humano de verdad
        const $btn = $('.form-card__btn-submit');
        $btn.prop('disabled', true).text('ENVIANDO...');

        fetch(scriptURL, { method: 'POST', body: new FormData(this)})
            .then(response => {
                alert('¡Bacán! Inscripción recibida.');
                this.reset();
                $btn.prop('disabled', false).text('ENVIAR MI INSCRIPCIÓN');
            })
            .catch(error => {
                alert('Chuta, hubo un error.');
                $btn.prop('disabled', false).text('ENVIAR MI INSCRIPCIÓN');
            });
    });
});