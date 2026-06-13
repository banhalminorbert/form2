
(function(){
  var nav=document.querySelector('.nav');
  var burger=document.querySelector('[data-burger]');
  if(burger){burger.addEventListener('click',function(){nav.classList.toggle('open');});}
  document.querySelectorAll('.navlinks a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');});});
  document.querySelectorAll('form[data-static-form]').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var toast=document.querySelector('.toast');
      if(toast){toast.classList.add('show'); setTimeout(function(){toast.classList.remove('show')}, 3600);}
    });
  });
})();
