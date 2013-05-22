

var confirmarSubmit = function(msg,form_name) {

   if (confirm(msg)) {
      document.all[form_name].submit();
   }
   return false;
}


