// app.js

$(document).ready(function() {
    
    // Pega aquí la URL que copiaste en el paso anterior
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyK8lZg09tWLVg1x-JOrchOcRj82GCVYNHU8WCgsytzw8zPttRgLMDeNrfiZudWLX_NVg/exec'; 
    const $form = $('#formInscripcion');

    $form.on('submit', function(e) {
        e.preventDefault();

        // Bloqueamos el botón para que no hagan mil clics
        const $btn = $('.btn-enviar');
        $btn.prop('disabled', true).text('ENVIANDO...');

        console.log("Mandando los datos a la planilla...");

        fetch(scriptURL, { 
            method: 'POST', 
            body: new FormData(this)
        })
        .then(response => {
            console.log('¡Éxito!', response);
            alert('¡Bacán! Los datos se guardaron en la planilla. ¡Nos vemos en la cancha!');
            this.reset(); // Limpio el formulario
            $btn.prop('disabled', false).text('FINALIZAR INSCRIPCIÓN');
        })
        .catch(error => {
            console.error('Error:', error.message);
            alert('Chuta, algo salió mal. Revisa tu conexión.');
            $btn.prop('disabled', false).text('FINALIZAR INSCRIPCIÓN');
        });
    });

    // Pequeño extra para validar edad
    $('#inputEdad').on('change', function() {
        if($(this).val() < 5) {
            alert("¿Tan pequeñito? ¡Qué tierno! Pero en Alto Tennis recibimos desde los 5 años.");
            $(this).val('');
        }
    });
});