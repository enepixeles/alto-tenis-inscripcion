// -----------------------------------------------------------
// LÓGICA INTEGRAL - ALTO TENNIS CLUB
// Yo mismo programé este script para que el registro sea 
// inteligente, seguro y muy amigable con el usuario.
// -----------------------------------------------------------

// A. LA FÓRMULA MAESTRA: Valida el RUT chileno (Algoritmo Módulo 11)
// Esta función asegura que el RUT sea real y evita que nos metan datos falsos.
function esRutValido(rut) {
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) return false;
    let [cuerpo, dv] = rut.split('-');
    let suma = 0;
    let factor = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * factor;
        factor = (factor === 7) ? 2 : factor + 1;
    }
    let dvEsperado = 11 - (suma % 11);
    if (dvEsperado === 11) dvEsperado = '0';
    else if (dvEsperado === 10) dvEsperado = 'k';
    else dvEsperado = dvEsperado.toString();
    return dv.toLowerCase() === dvEsperado;
}

$(document).ready(function() {
    
    // 1. Configuración de la Base de Datos
    // Aquí pegué mi URL de la App Web de Google (la que termina en /exec)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyK8lZg09tWLVg1x-JOrchOcRj82GCVYNHU8WCgsytzw8zPttRgLMDeNrfiZudWLX_NVg/exec';
    
    const $form = $('#formInscripcion');
    const $inputRut = $('#inputRut');
    const $rutError = $('#rutError'); // Error de formato
    const $rutDuplicadoError = $('#rutDuplicadoError'); // Error de RUT ya registrado

    // 2. FORMATEO DINÁMICO DEL RUT (12.345.678-9)
    // Hice que los puntos y el guion se pongan solitos mientras el usuario escribe.
    $inputRut.on('input', function() {
        let valor = $(this).val().replace(/[^\dkK]/g, ''); 
        
        if (valor.length < 2) {
            $(this).val(valor);
            return;
        }
        
        let cuerpo = valor.slice(0, -1);
        let dv = valor.slice(-1).toUpperCase();
        
        let cuerpoFormateado = "";
        while (cuerpo.length > 3) {
            cuerpoFormateado = "." + cuerpo.slice(-3) + cuerpoFormateado;
            cuerpo = cuerpo.slice(0, -3);
        }
        cuerpoFormateado = cuerpo + cuerpoFormateado;
        
        $(this).val(cuerpoFormateado + "-" + dv);
        
        // Limpié todos los errores visuales apenas el usuario empieza a corregir
        $rutError.hide();
        $rutDuplicadoError.hide();
        $(this).css('border-color', '#ccc');
    });

    // 3. LÓGICA DE EDAD (Aparición de Apoderado y Aviso de Contacto)
    // Calculé si el alumno tiene menos de 18 años para mostrar los campos extra.
    $('#fechaNacimiento').on('change', function() {
        const fechaNace = new Date($(this).val());
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNace.getFullYear();
        const mes = hoy.getMonth() - fechaNace.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNace.getDate())) {
            edad--;
        }

        if (edad < 18) {
            // Si es menor, mostré la sección y el aviso de contacto
            $('#seccionApoderado').slideDown();
            $('#avisoMenorEdad').fadeIn();
            $('#inputCategoria').val('Menor de Edad');
            $('input[name^="apoderado_"]').prop('required', true);
        } else {
            // Si es adulto, escondí todo y reseteé esos campos
            $('#seccionApoderado').slideUp();
            $('#avisoMenorEdad').fadeOut();
            $('#inputCategoria').val('Adulto');
            $('input[name^="apoderado_"]').prop('required', false).val('');
        }
    });

    // 4. FORMATO DEL TELÉFONO (+569 1234 56 78)
    // Programé esto para que el número sea fácil de leer y cumpla el formato chileno.
    $('input[name="telefono"]').on('input', function() {
        let valor = $(this).val().replace(/[^\d+]/g, ''); 
        if (!valor.startsWith('+569')) valor = '+569';

        let soloNumeros = valor.replace('+569', '').replace(/\D/g, '').substring(0, 8);
        let nuevoValor = '+569';
        if (soloNumeros.length > 0) nuevoValor += ' ' + soloNumeros.substring(0, 4);
        if (soloNumeros.length > 4) nuevoValor += ' ' + soloNumeros.substring(4, 6);
        if (soloNumeros.length > 6) nuevoValor += ' ' + soloNumeros.substring(6, 8);

        $(this).val(nuevoValor);
    });

    // 5. MENSAJE DE COMPROMISO PERSONALIZADO
    const checkbox = document.getElementById('checkCompromiso');
    checkbox.oninvalid = function(e) {
        e.target.setCustomValidity('¡Psh! No olvides aceptar el compromiso para poder inscribirte.');
    };
    checkbox.oninput = function(e) {
        e.target.setCustomValidity('');
    };

    // 6. ENVÍO FINAL DE DATOS (Fetch)
    // Aquí es donde ocurre la magia: mandamos todo a la planilla de Google.
    $form.on('submit', function(e) {
        e.preventDefault();

        // Validación de RUT: Quitamos puntos para la matemática
        const rutLimpio = $inputRut.val().replace(/\./g, ''); 
        if (!esRutValido(rutLimpio)) {
            $rutError.show(); // Mostré el mensaje rojo en el HTML
            $inputRut.css('border-color', '#dc3545').focus();
            return false;
        }

        // Trampa para Bots (Honeypot)
        if ($('input[name="trampa_bot"]').val() !== "") return false;

        // Puse el botón en "modo espera" para que el usuario no se desespere
        const $btn = $('.form-card__btn-submit');
        const textoOriginal = $btn.text();
        $btn.prop('disabled', true).text('ENVIANDO INSCRIPCIÓN...');

        // Lanzamos la petición a Google
        fetch(scriptURL, { method: 'POST', body: new FormData(this)})
            .then(response => response.json()) // Interpretamos la respuesta como un objeto
            .then(data => {
                if (data.result === 'success') {
                    // ¡Golazo! Los datos se guardaron
                    alert('¡Bacán! Tu inscripción fue recibida con éxito. ¡Nos vemos en la cancha!');
                    this.reset();
                    $('#seccionApoderado, #avisoMenorEdad').hide();
                    } else if (data.error === 'duplicado') {
                        $rutDuplicadoError.fadeIn(); 
                        // CAMBIO: Ahora el borde también se pone rojo fuerte
                        $inputRut.css('border-color', '#dc3545').focus(); 
                } else {
                    alert('Chuta, tuvimos un error en el servidor. Inténtalo más tarde.');
                }
                $btn.prop('disabled', false).text(textoOriginal);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un problema de conexión. Revisa tu internet e intenta de nuevo.');
                $btn.prop('disabled', false).text(textoOriginal);
            });
    });

});