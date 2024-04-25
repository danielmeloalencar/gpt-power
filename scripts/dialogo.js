function getInputType(fieldType = "textarea") {
  let result = "";
  switch (fieldType) {
    case 'textarea':
      result = '<textarea id="edited-item" rows="10" cols="50" class="input"></textarea>'
      break;
    case "number":
      result = '<input type="number" id="edited-item" class="input" />'
      break;
    case "text":
      result = '<input type="text" id="edited-item" class="input"/>'
      break;
    case "email":
      result = '<input type="email" id="edited-item" class="input" />'
      break;
    case "date":
      result = '<input type="date" id="edited-item" class="input"/>'
      break;
    default:
      result = "text"
  }
  return result;
}


// Função para exibir um prompt personalizado com o elemento dialog
function showDialog(options = {
  header: "",
  message: "",
  example: "",
  type: "prompt",
  fieldType: 'textarea'
}, callbackFunction) {
  return new Promise((resolve, reject) => {
    let dialog = null;
     //se o dialog não existir, crie-o
    dialog = document.getElementById('dialog-gpt-power')

    if( dialog === null){   
    dialog = document.createElement('dialog');
    }
    //adiciona id dialog-gpt-power ao dialog
    dialog.id = "dialog-gpt-power";

    dialog.innerHTML = `
      <header>${options.header}</header>
      <label>Preencha a variável:</label><br /> 
      <label style="color:#28ffd9;">${options.message}</label> <br /> <br />  
      <label style="color:#FFF;">Exemplo: <br /> ${options.example}</label> <br /> 
     
      <br /> <br />
      ${getInputType(options.fieldType)}
      <br /> <br />
      <div class="dialogFooter">
        <button id="cancelBtn" class="cancelButton">Cancelar</button>
        <button id="confirmBtn" class="confirmButton">Confirmar</button>
      </div> 
    `;

    dialog.setAttribute("class", "dialog")

    document.body.appendChild(dialog);

    const confirmButtonEvent = () => {
      if (callbackFunction) {
        if (options.fieldType !== "confirm")
          callbackFunction(document.getElementById('edited-item').value)
        else if (options.fieldType == "confirm")
          callbackFunction(true)
      }

      dialog.close();
      resolve(true); // Resolve a promessa com true quando confirmado
    }

    const cancelButtonEvent = () => {
      if (callbackFunction) {
        callbackFunction(false)
      }
      dialog.close();
      resolve(false); // Resolve a promessa com false quando cancela
    }

    document.getElementById('confirmBtn').addEventListener('click', confirmButtonEvent);
    document.getElementById('cancelBtn').addEventListener('click', cancelButtonEvent);

    dialog.showModal();

    // Remover os ouvintes de eventos e o diálogo antes de criar um novo
    dialog.addEventListener('close', () => {
     // document.getElementById('confirmBtn').removeEventListener('click', confirmButtonEvent)
    // document.getElementById('cancelBtn').removeEventListener('click', cancelButtonEvent)
    //  dialog.remove();
    });
  });
}
