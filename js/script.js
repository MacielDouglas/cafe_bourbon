function update() {
  var select = document.getElementById("inputMensal");
  var value = select.options[select.selectedIndex].value;
  var tipo_cafe = document.getElementById("moido_tipo");
  console.log(value);

  if (value == "2") {
    tipo_cafe.classList.remove("hide");
  } else {
    tipo_cafe.classList.add("hide");
  }
}

function update2(){
    update2() = update();
    
} 

