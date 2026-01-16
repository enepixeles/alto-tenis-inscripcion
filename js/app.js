// -----------------------------------------------------------
// LÓGICA INTEGRAL - ALTO TENNIS CLUB
// Programado por mí para que el registro sea perfecto de punta a punta.
// -----------------------------------------------------------

// A. LA FÓRMULA MAESTRA: Valida el RUT chileno (Algoritmo Módulo 11)
// Me aseguro de que el RUT sea real para que no nos metan datos falsos.
function esRutValido(rut) {
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) return false;
    let [cuerpo, dv] = rut.split('-');
    let suma = 0, factor = 2;
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
    
    // 1. MI CONFIGURACIÓN
    // Esta es la URL de mi aplicación en la nube de Google
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyK8lZg09tWLVg1x-JOrchOcRj82GCVYNHU8WCgsytzw8zPttRgLMDeNrfiZudWLX_NVg/exec';
    
    const $form = $('#formInscripcion');
    const $inputRut = $('#inputRut');
    const $rutError = $('#rutError');
    const $rutDuplicadoError = $('#rutDuplicadoError');

    // 2. CONFIGURACIÓN DEL CALENDARIO (Flatpickr)
    // Programé el calendario para que solo deje elegir SÁBADOS del mes actual.
    const hoy = new Date();
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    flatpickr("#calendarioSabatino", {
        locale: "es",
        minDate: "today",
        maxDate: ultimoDiaMes,
        dateFormat: "d-m-Y",
        disable: [
            function(date) {
                // Bloqueamos todo lo que NO sea sábado (Sábado es 6)
                return (date.getDay() !== 6);
            }
        ]
    });

    // 3. LÓGICA DEL BOTÓN AGENDAR (WhatsApp)
    // Armé el mensaje para que salga limpio y sin caracteres extraños.
    $('#btnAgendar').on('click', function() {
        const fechaElegida = $('#calendarioSabatino').val();
        if (!fechaElegida) {
            alert("Por favor, elige primero un sábado en el calendario.");
            return;
        }

        const nombre = $('input[name="primer_nombre"]').val();
        const apellido = $('input[name="apellido_paterno"]').val();
        
        // Texto limpio para evitar el error de codificación (el signo ?)
        const texto = "Hola! Soy " + nombre + " " + apellido + ". Confirmo mi asistencia para mi primera clase el sábado " + fechaElegida + " de 9:00 a 11:00 AM.";
        
        const linkFinal = "https://wa.me/56945560196?text=" + encodeURIComponent(texto);
        window.open(linkFinal, '_blank');
    });

    // 4. FORMATEO DINÁMICO DEL RUT
    // Puse esta lógica para que los puntos y el guion se pongan solos al escribir.
    $inputRut.on('input', function() {
        let valor = $(this).val().replace(/[^\dkK]/g, ''); 
        if (valor.length < 2) { $(this).val(valor); return; }
        
        let cuerpo = valor.slice(0, -1);
        let dv = valor.slice(-1).toUpperCase();
        let f = "";
        while (cuerpo.length > 3) { f = "." + cuerpo.slice(-3) + f; cuerpo = cuerpo.slice(0, -3); }
        $(this).val(cuerpo + f + "-" + dv);

        // Limpio los avisos de error mientras el usuario corrige
        $rutError.hide();
        $rutDuplicadoError.hide();
        $(this).css('border-color', '#ccc');
    });

    // 5. CÁLCULO DE EDAD
    // Decidí si mostrar o no la sección de apoderado según la fecha elegida.
    $('#fechaNacimiento').on('change', function() {
        const d = new Date($(this).val());
        const n = new Date();
        let e = n.getFullYear() - d.getFullYear();
        if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) {
            e--;
        }

        if (e < 18) {
            $('#seccionApoderado, #avisoMenorEdad').fadeIn();
            $('#inputCategoria').val('Menor de Edad');
            $('input[name^="apoderado_"]').prop('required', true);
        } else {
            $('#seccionApoderado, #avisoMenorEdad').fadeOut();
            $('#inputCategoria').val('Adulto');
            $('input[name^="apoderado_"]').prop('required', false).val('');
        }
    });

    // 6. FORMATO DE TELÉFONO (+569 XXXX XX XX)
    $('input[name="telefono"]').on('input', function() {
        let v = $(this).val().replace(/[^\d+]/g, ''); 
        if (!v.startsWith('+569')) v = '+569';
        let n = v.replace('+569', '').replace(/\D/g, '').substring(0, 8);
        let nv = '+569';
        if (n.length > 0) nv += ' ' + n.substring(0, 4);
        if (n.length > 4) nv += ' ' + n.substring(4, 6);
        if (n.length > 6) nv += ' ' + n.substring(6, 8);
        $(this).val(nv);
    });

    // 7. MENSAJE PERSONALIZADO DEL COMPROMISO
    const checkbox = document.getElementById('checkCompromiso');
    checkbox.oninvalid = (e) => e.target.setCustomValidity('No olvides aceptar el compromiso para inscribirte.');
    checkbox.oninput = (e) => e.target.setCustomValidity('');

    // 8. ENVÍO DEL FORMULARIO Y VISTA DE ÉXITO
    // Aquí mandamos todo a Google y, si sale bien, mostramos el calendario.
    $form.on('submit', function(e) {
        e.preventDefault();

        const rutLimpio = $inputRut.val().replace(/\./g, ''); 
        if (!esRutValido(rutLimpio)) {
            $rutError.show();
            $inputRut.css('border-color', '#dc3545').focus();
            return false;
        }

        if ($('input[name="trampa_bot"]').val() !== "") return false;

        const $btn = $('.form-card__btn-submit');
        $btn.prop('disabled', true).text('ENVIANDO...');

        fetch(scriptURL, { method: 'POST', body: new FormData(this)})
            .then(r => r.json())
            .then(d => {
                if (d.result === 'success') {
                    // --- LA VICTORIA ---
                    $('#formContent').hide();
                    $('#successContent').fadeIn();
                } else if (d.error === 'duplicado') {
                    $rutDuplicadoError.fadeIn();
                    $inputRut.css('border-color', '#dc3545').focus();
                    $btn.prop('disabled', false).text('ENVIAR INSCRIPCIÓN');
                }
            })
            .catch(() => { 
                alert('Chuta, hubo un error de conexión. Intenta de nuevo.'); 
                $btn.prop('disabled', false).text('ENVIAR INSCRIPCIÓN');
            });
    });

});