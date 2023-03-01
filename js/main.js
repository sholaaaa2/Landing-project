window.onload = function () {
  var $button = $(".wheel_btn"),
    $spinner = $(".wheel_spinner"),
    $popupOverlay = $(".popup_overlay"),
    $popupWindow = $(".popup_window"),
    $popupBtn = $(".popup_btn"),
    $formConatiner = $(".form_conatiner"),
    $formEmail = $(".email_form"),
    $formTel = $(".tel_form"),
    $emailInput = $("#email_input"),
    $telInput = $("#tel_input"),
    $passwordEmail = $("#password_email"),
    $passwordTel = $("#password_tel"),
    $emailInvalid = $(".email_invalid"),
    $passEmailInvalid = $(".pass_email_invalid"),
    $telInvalid = $(".tel_invalid"),
    $passTelInvalid = $(".pass_tel_invalid"),
    $emailSelect = $("#email_select"),
    $telSelect = $("#tel_select"),
    $emailSubmit = $("#email_submit"),
    $telSubmit = $("#tel_submit"),
    $siteKey = null,
    $token = null;

  $.get("https://api.spinbetter.org/api/recaptcha/token")
  .done(function(data) {
      $siteKey = data.siteKey;
      console.log($siteKey + " siteKey")
      renderRecaptcha();
  })
  .fail(function(error) {
      console.log("Error: " + error.statusText);
  });

  function renderRecaptcha() {
    var script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=' + $siteKey;
    document.body.appendChild(script);
    console.log(script.src);
  }

    

  function getToken() {
    grecaptcha.execute($siteKey, {action: 'submit'}).then(function(token) {
      console.log(token + " 1");
      $token = token;
    });
  }

  $formEmail.submit(function (e) {
    e.preventDefault();
    let reqest = {
      "visitor": null,
      "clientToken": null,
      "country": "RU",
      "currency": $emailSelect.val(),
      "email": $emailInput.val(),
      "password": $passwordEmail.val(),
      "send": true,
      "bonus": 2
    }
    getToken() 
    setTimeout(()=>{
        reqest["visitor"]  = fingerPrint;
        reqest["clientToken"]  = $token;

        console.log($token + " 2");
        console.log(fingerPrint + " fingerPrint")
        console.log(reqest)

        $.ajax({
          type: 'POST',
          url: 'https://api.spinbetter.org/api/users',
          data: JSON.stringify(reqest),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data) {
            console.log('Success:', data);
            let successUrl ="https://" + data.domain + "/" + data.main + "&is_remember_user=true&url=slots";
            console.log(successUrl);
            window.location.href = successUrl;
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error:', jqXHR.responseJSON["error"]);

            reqestErrors(jqXHR.responseJSON["error"], "email")
          }
        });
    }, 500)
  })
  $formTel.submit(function (e) {
    e.preventDefault();
    console.log($telInput.val().replace("+",""))
    let reqest = {
      "visitor": null,
      "clientToken": null,
      "country": "RU",
      "currency": $telSelect.val(),
      "phone": $telInput.val().replace("+",""),
      "password": $passwordTel.val(),
      "send": true,
      "bonus": 2
    }
    getToken() 
    setTimeout(()=>{
        reqest["visitor"]  = fingerPrint;
        reqest["clientToken"]  = $token;
        reqest["parse"]  = true;

        console.log($token + " 2");
        console.log(fingerPrint + " fingerPrint")
        console.log(reqest)

        $.ajax({
          type: 'POST',
          url: 'https://api.spinbetter.org/api/users',
          data: JSON.stringify(reqest),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data) {
            console.log('Success:', data);

            let successUrl ="https://" + data.domain + "/" + data.main + "&is_remember_user=true&url=slots";
            console.log(successUrl);
            window.location.href = successUrl;
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error:', jqXHR.responseJSON["error"]);

            reqestErrors(jqXHR.responseJSON["error"], "tel")
          }
        });
    }, 500)
  })
  
  function reqestErrors(request, type) {
    switch (request) {
      case "PHONE_IN_USE":
        showError("Такой номер уже зарегистрирован", type)
        break;
      case "EMAIL_IN_USE":
        showError("Такой E-mail уже используется", type)
        break;
      case "INVALID_PHONE":
      case "PARSE_PHONE":
      case "MATCH_PHONE":
        showError("Номер телефона указан неверно", type)
        break;
      case "INVALID_CAPTCHA":
        showError("Ошибка. К сожалению, нам не удалось проверить подлинность капчи.", "default_" + type)
        break;                
      default:
        showError("Произошла ошибка. Пожалуйста, повторите попытку позже.","default_" + type)
        break;
    }
  }
  function showError(text, type) {
    const selector ="." + type + "_error"
    var img = document.createElement('img');
    img.src = "./img/warning.svg";
    
    $(selector).text(text)
    $(selector).prepend(img)
    
  }

  $('#dropdown_tel .options').hide();
  $('#dropdown_email .options').hide();

  $('.dropdown .selected').click(function(e) {
    // Toggle the visibility of the options dropdown
    $(this).siblings('.options').toggle();
    $(this).toggleClass('open');
    e.stopPropagation();
  });

  $('#dropdown_tel .options').click(function(e) {
    var value = $(e.target).data('value');
    var text = $(e.target).text();

    $('#tel_select').val(value);
    $('#dropdown_tel .selected div').text(text);
    $('#dropdown_tel .selected').toggleClass('open');

    $('.dropdown .options').hide();
  });

  $('#dropdown_email .options').click(function(e) {
    var value = $(e.target).data('value');
    var text = $(e.target).text();

    $('#email_select').val(value);
    $('#dropdown_email .selected div').text(text);
    $('#dropdown_email .selected').toggleClass('open');

    $('.dropdown .options').hide();
  });

  $('.popup_overlay').click(function () {
    $('#dropdown_tel .options').hide();
    $('#dropdown_email .options').hide();
    $('.dropdown .selected').removeClass('open');
  })


  $button.click(function () {
    if ($button.hasClass("spin")) {
      spin();
    }
  });

  $popupBtn.click(function () {
    $popupWindow.fadeOut();
    $formConatiner.fadeIn();
  })


  $emailInput.on('input', function () {
    if (validEmail($(this).val())) {
      $emailInvalid.text("");
      $(this).attr('data-invalid', 'false');
      if ($passwordEmail.val().length>=6 && validPassword($passwordEmail.val())) {
        $emailSubmit.prop('disabled', false);
      } else{
        $emailSubmit.prop('disabled', true);
      }
    } else {
      $emailInvalid.text("E-mail введен некорректно.");
      $(this).attr('data-invalid', 'true');
      $emailSubmit.prop('disabled', true);
    }
  })
  $passwordEmail.on('input', function () {
    if ($(this).val().length>=6) {
      $passEmailInvalid.text("");
      $(this).attr('data-invalid', 'false')
      if (validPassword($(this).val())) {
        if (validEmail($emailInput.val())) {
          $emailSubmit.prop('disabled', false);
        } else{
          $emailSubmit.prop('disabled', true);
        }
      } else{
        $passEmailInvalid.text("Пароль должен содержать латинские буквы и цифры.");
        $(this).attr('data-invalid', 'true');
        $emailSubmit.prop('disabled', true);
      }
    } else {
      $passEmailInvalid.text("Минимальное количество символов - 6.");
      $(this).attr('data-invalid', 'true');
      $emailSubmit.prop('disabled', true);
    }
  })

  $telInput.on('input', function () {
    if (validPhone($(this).val())) {
      $telInvalid.text("");
      $(this).attr('data-invalid', 'false');
      if ($passwordTel.val().length>=6 && validPassword($passwordTel.val())) {
        $telSubmit.prop('disabled', false);
      } else{
        $telSubmit.prop('disabled', true);
      }
    } else {
      $telInvalid.text("Номер введен некорректно.");
      $(this).attr('data-invalid', 'true');
      $telSubmit.prop('disabled', true);
    }
  })
  $passwordTel.on('input', function () {
    if ($(this).val().length>=6) {
      $passTelInvalid.text("");
      $(this).attr('data-invalid', 'false')
      if (validPassword($(this).val())) {
        if (validPhone($telInput.val())) {
          $telSubmit.prop('disabled', false);
        } else{
          $telSubmit.prop('disabled', true);
        }
      } else{
        $passTelInvalid.text("Пароль должен содержать латинские буквы и цифры.");
        $(this).attr('data-invalid', 'true');
        $telSubmit.prop('disabled', true);
      }
    } else {
      $passTelInvalid.text("Минимальное количество символов - 6.");
      $(this).attr('data-invalid', 'true');
      $telSubmit.prop('disabled', true);
    }
  })


  


  function spin() {
    $button.removeClass("spin").addClass("disabled");
    $spinner
      .addClass("wheel_spinner_animated_1")
      .removeClass("wheel_spinner_animated");
    setTimeout(function () {
      localStorage.currentSpin = "HTMLC_1466_v24_spin";
      $popupOverlay.fadeIn();
      $popupWindow.fadeIn();
    }, 4500);
  }

  function validEmail(email) {
    let reg =/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    return reg.test(email)
  }
  function validPhone(phone) {
    let reg = /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    return reg.test(phone);
  }
  function validPassword(password) {
    let reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/ ;
    return reg.test(password)
  }

  switch (localStorage.currentSpin) {
    case "HTMLC_1466_v24_spin":
      $popupOverlay.fadeIn();
      $popupWindow.fadeIn();
      $spinner
        .removeClass("wheel_spinner_animated")
        .css("transform", "rotate(720deg)");
      $button.removeClass("spin").addClass("disabled");
      break;
    default:
      break;
  }
};
