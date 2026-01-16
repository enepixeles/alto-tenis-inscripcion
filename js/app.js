// -----------------------------------------------------------
// LÓGICA DEL FORMULARIO - ALTO TENNIS CLUB (Versión Final Corregida)
// -----------------------------------------------------------

$(document).ready(function() {
    
    // 1. Configuración de la planilla (Google Sheets)
    // ¡No olvides poner tu URL real aquí!
    const scriptURL = 'TU_URL_DE_GOOGLE_AQUÍ';
    const $form = $('#formInscripcion');

    // 2. Cálculo de Edad y Sección Apoderado
    $('#fechaNacimiento').on('change', function() {
        const fechaNace = new Date($(this).val());
        const hoy = new Date();
        
        let edad = hoy.getFullYear() - fechaNace.getFullYear();
        const mes = hoy.getMonth() - fechaNace.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNace.getDate())) {
            edad--;
        }

        if (edad < 18) {
            $('#seccionApoderado').slideDown();
            $('#inputCategoria').val('Menor de Edad');
            $('input[name^="apoderado_"]').prop('required', true);
        } else {
            $('#seccionApoderado').slideUp();
            $('#inputCategoria').val('Adulto');
            $('input[name^="apoderado_"]').prop('required', false).val('');
        }
    });

    // 3. Formato Dinámico del Teléfono (+569 1234 56 78)
    // Esta función limpia y ordena el número mientras escribes
    $('input[name="telefono"]').on('input', function() {
        // Dejamos solo el "+" y los números
        let valor = $(this).val().replace(/[^\d+]/g, ''); 
        
        // Si borra el prefijo, se lo devolvemos al tiro
        if (!valor.startsWith('+569')) {
            valor = '+569';
        }

        // Sacamos solo los 8 números que vienen después del +569
        let soloNumeros = valor.replace('+569', '').replace(/\D/g, '');
        soloNumeros = soloNumeros.substring(0, 8); 

        // Armamos el texto final con los espacios reglamentarios
        let nuevoValor = '+569';
        if (soloNumeros.length > 0) {
            nuevoValor += ' ' + soloNumeros.substring(0, 4);
        }
        if (soloNumeros.length > 4) {
            nuevoValor += ' ' + soloNumeros.substring(4, 6);
        }
        if (soloNumeros.length > 6) {
            nuevoValor += ' ' + soloNumeros.substring(6, 8);
        }

        $(this).val(nuevoValor);
    });

    // 4. Mensajes personalizados para los errores
    const checkbox = document.getElementById('checkCompromiso');
    
    // Para el compromiso
    checkbox.oninvalid = function(e) {
        e.target.setCustomValidity('¡Psh! No olvides aceptar el compromiso para poder inscribirte.');
    };
    checkbox.oninput = function(e) {
        e.target.setCustomValidity('');
    };

    // 5. Envío de datos por FETCH
    $form.on('submit', function(e) {
        e.preventDefault();

        // Trampa para pillar bots (Honeypot)
        if ($('input[name="trampa_bot"]').val() !== "") return false;

        const $btn = $('.form-card__btn-submit');
        const textoOriginal = $btn.text();
        $btn.prop('disabled', true).text('ENVIANDO...');

        fetch(scriptURL, { 
            method: 'POST', 
            body: new FormData(this)
        })
        .then(response => {
            alert('Ya recibimos tu inscripción. ¡Nos vemos en la cancha!');
            this.reset();
            $('#seccionApoderado').hide();
            $btn.prop('disabled', false).text(textoOriginal);
        })
        .catch(error => {
            alert('Chuta, tuvimos un problema. Revisa tu internet e intenta de nuevo.');
            $btn.prop('disabled', false).text(textoOriginal);
        });
    });

});