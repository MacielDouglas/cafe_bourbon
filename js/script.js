function updates(valo) {
  const selecionado = document.getElementById(valo).value;

  const tipo_cafe = document.getElementById('moido_' + valo);

  if (valo === 'coffeLove' && selecionado === '2') {
    tipo_cafe.classList.remove('hide');
  } else if (valo === 'mensal' && selecionado === '2') {
    tipo_cafe.classList.remove('hide');
  } else if (valo === 'trimestral' && selecionado === '2') {
    tipo_cafe.classList.remove('hide');
  } else {
    tipo_cafe.classList.add('hide');
  }
}
