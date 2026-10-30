/* Country code picker for every .phone-input
   - keeps the hidden field named in data-countrycode-id in sync (e.g. "+91")
   - digits only, max 15 */
(function () {
  if (!window.intlTelInput) return;
  window.itiInstances = {};

  document.querySelectorAll('.phone-input').forEach(function (input) {
    var iti = window.intlTelInput(input, {
      initialCountry: 'in',
      preferredCountries: ['in', 'ae', 'us', 'gb', 'sg'],
      separateDialCode: true,
      autoPlaceholder: 'off'
    });
    window.itiInstances[input.id] = iti;

    var hidden = document.getElementById(input.getAttribute('data-countrycode-id'));
    function sync() {
      if (hidden) hidden.value = '+' + iti.getSelectedCountryData().dialCode;
    }
    input.addEventListener('countrychange', sync);
    sync();

    input.addEventListener('input', function () {
      var clean = input.value.replace(/\D/g, '').slice(0, 15);
      if (clean !== input.value) input.value = clean;
    });
  });
})();
