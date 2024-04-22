function camelCaseToReadable(camelCase) {
  // Divida a string camelCase em palavras separadas
  let words = camelCase.replace(/([a-z])([A-Z])/g, '$1 $2').split(/(?=[A-Z])/);
  
  // Capitalize a primeira letra de cada palavra
  let result = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return result;
}


async function main() {
  var mode = "add";
  var editItemName = "";
  // Load existing list items from localStorage
  const storedItems = localStorage.getItem('listItems');
  const parsedItems = storedItems ? JSON.parse(storedItems) : [];

  const sidebarContainer = document.createElement('div');
  sidebarContainer.classList.add('sidebar-container');
  sidebarContainer.style.position = 'fixed';
  sidebarContainer.style.top = '0';
  sidebarContainer.style.right = '0';
  sidebarContainer.style.width = '400px';
  sidebarContainer.style.height = '100%';
  sidebarContainer.style.padding = '10px';
  sidebarContainer.style.backgroundColor = '#333333';

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Abrir';

  closeButton.style.borderBottomLeftRadius = '10px';
  closeButton.style.borderBottomRightRadius = '10px';
  closeButton.style.marginLeft= '-5px';
  closeButton.classList.add('close-button');
  closeButton.addEventListener('click', toggleSidebar);

  const headerContainer = document.createElement('div');
  headerContainer.classList.add('header-container');
  headerContainer.innerHTML = '<h6 style="text-align:center;">GPT POWER</h6>';


  const tabContainer = document.createElement('div');
  tabContainer.classList.add('tab-container');

  const tab1Button = document.createElement('button');
  tab1Button.textContent = 'Minha Galeria';
  tab1Button.classList.add('tab-button');
  tab1Button.addEventListener('click', tabLoadUserPrompts);

  const tab2Button = document.createElement('button');
  tab2Button.textContent = 'Galeria do Sistema';
  tab2Button.classList.add('tab-button');
  tab2Button.addEventListener('click', tabFetchPrompts);

  const listContainer = document.createElement('ul');
  listContainer.style.height = 'calc(100% - 100px)';
  listContainer.style.overflow = 'scroll';
  listContainer.style.marginBottom = '10px';

  const inputContainer = document.createElement('div');
  inputContainer.style.display = 'flex';
  inputContainer.style.flexDirection = 'column';

  inputContainer.style.justifyContent = 'center';
  inputContainer.style.alignItems = 'center';
  inputContainer.style.gap = '10px';
  inputContainer.id = 'input-container';

  /*** NOVO */

  const newItemTitle = document.createElement('input');
  newItemTitle.type = 'text';
  newItemTitle.style.color = 'black';
  newItemTitle.placeholder = 'Título do Prompt';
  newItemTitle.id = 'new-item-title';
  newItemTitle.style.backgroundColor = '#FFF';
  newItemTitle.style.width = '100%';
  newItemTitle.rows = '6';
   newItemTitle.style.borderRadius = '5px';


  const newItemInput = document.createElement('textarea');
  newItemInput.type = 'text';
  newItemInput.style.color = 'black';
  newItemInput.placeholder = 'Novo Prompt';
  newItemInput.id = 'new-item-input';
  newItemInput.style.width = '100%';
  newItemInput.rows = '6';
  newItemInput.style.overflow = 'scroll';
  newItemInput.style.borderRadius = '5px';

  const addButton = document.createElement('button');
  addButton.textContent = 'Adicionar';
  addButton.classList.add('add-button');
  addButton.style.background = 'linear-gradient(to right, rgb(92 92 229), rgb(92 92 229))';
  addButton.style.width = '100%';
  addButton.style.margin = '0px';
  addButton.style.borderRadius = '5px';
  addButton.id = 'add-button';
  addButton.addEventListener('click', handleAddButtonClick);


  /////////////////

  /***** EDITAR  *****/


  sidebarContainer.append(headerContainer, closeButton, tabContainer, listContainer, inputContainer);

  tabContainer.append(tab1Button, tab2Button);
  inputContainer.append(newItemTitle, newItemInput, addButton);
  document.body.appendChild(sidebarContainer);


  // Initialize the list items with the stored items
  parsedItems.forEach((itemText) => {
    const listItem = createListItem(itemText);
    listItem.addEventListener('click', (event) => handleListItemClick(event, itemText));
    listContainer.appendChild(listItem);
  });

  /****************************MINHA CUSTOMIZAÇÃO *****************************************/
  // Função para preencher as variáveis na string
  async function preencherVariaveis(string) {
    // Expressão regular para encontrar as variáveis entre {{ e }}
    var regex = /{{(.*?)}}/g;
    var match;
    var variaveis = {};
    var value=""
    // Encontrar todas as variáveis na string e solicitar o preenchimento
    while ((match = regex.exec(string)) !== null ) {
      // Extrair o nome da variável
      var variavel = match[1].trim();



      const resultado = await showDialog({
        header: "GPT Power - Preencher Variáveis",
        message: 'Digite o valor para "' + camelCaseToReadable(variavel) + '":',
        fieldType: "textarea"

      }, (result) => {  if (result)  value = result; });


      if( resultado === false){
        return false;
      }
      variaveis[variavel]= value;
    }
  

    // Substituir as variáveis na string pelos valores preenchidos
    for (var key in variaveis) {
      if (variaveis.hasOwnProperty(key)) {
        string = string.replace(new RegExp("{{" + key + "}}", "g"), variaveis[key]);
      }
    }

    // Retornar a string completa com as variáveis preenchidas
    return string;
  }



  async function handleListItemClick(event, text = "") {
    const form = document.querySelector('form');
    const input = form?.querySelector('textarea');
    let inputarea; 
    var newText = await preencherVariaveis(text);

    if (newText === false)
      return;

    if (input == null) {
      const textarea = document.querySelector('textarea');
      const dataId = textarea.getAttribute('data-id');
      inputarea = document.querySelector(`[data-id="${dataId}"]`);
      if (text !== "") {
        inputarea.value = newText;
      } else {
        inputarea.value = event.target.textContent;
      }
    } else {
      inputarea = input; // Assign the value of input to inputarea
      if (text !== "") {
        inputarea.value = newText;
      } else {
        inputarea.value = event.target.textContent;
      }
    }

    // Selecione o textarea pelo seu ID
    const textarea = document.getElementById('prompt-textarea');


    //textarea.value = 'Primeira interação';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));



    // Selecione o botão pelo seu atributo data-testid
    const button = document.querySelector('[data-testid="send-button"]');

    // Remova o atributo disabled
    //button.removeAttribute('disabled');

    // Aguarde um pequeno intervalo de tempo (por exemplo, 100 milissegundos) antes de simular o clique
    setTimeout(() => {
      // Simule um clique no botão
      button.click();
    }, 500);
  }


  function createListItem(item, isUser = true) {
    let text = item;
    const itemContainer = document.createElement('div');
    itemContainer.style.display = 'flex';
    itemContainer.style.justifyContent = 'center';
    itemContainer.style.flexDirection = 'column';
    itemContainer.style.alignItems = 'center';
    
    const listItem = document.createElement('li');
    listItem.textContent = text.prompt;
    listItem.classList.add('list-item');
    listItem.style.cursor = 'pointer';
    listItem.style.padding = '10px';
    listItem.style.display = 'flex';
    listItem.style.flexDirection = 'column';
    listItem.style.justifyContent = 'center';
    listItem.style.backgroundColor = '#1113';

    const divAcoes = document.createElement('div');
    divAcoes.style.display = 'flex';
    divAcoes.style.gap = '10px';
    divAcoes.style.flexDirection = 'column';
    divAcoes.style.padding = '10px';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remover';
    removeButton.classList.add('remove-button');
    removeButton.style.marginLeft = '10px';
    //adiciona cor de fundo do botão de remover na cor gradiente vermelha
    removeButton.style.background = 'linear-gradient(to right, #a00000, #a00000)';
    removeButton.style.padding = '5px';
    removeButton.style.width = '100%';
    removeButton.style.color = 'white';
    removeButton.style.borderRadius = '10px';
    // alinha o botão a direita do item da lista
      removeButton.addEventListener('click', (e) => handleRemoveButtonClick(e, text));

    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.classList.add('edit-button');
    editButton.style.marginLeft = '10px';
    //adiciona cor de fundo do botão de editar na cor gradiente azul
    editButton.style.background = 'linear-gradient(to right, rgb(92 92 229), rgb(92 92 229))';
    editButton.style.width = '100%';
    editButton.style.padding = '5px';
    editButton.style.color = 'white';
    editButton.style.borderRadius = '10px';
    // alinha o botão a direita do item da lista
    editButton.addEventListener('click', (e) => handleEditButtonClick(e, text));


    const promptCategory = document.createElement('div');
    promptCategory.textContent = text.title;
    promptCategory.classList.add('prompt-category');
    promptCategory.style.width = '100%';
    promptCategory.style.display = 'flex';
    //adiciona cor de fundo do botão de editar na cor gradiente azul
    promptCategory.style.background = 'linear-gradient(to right, rgb(92 92 100),rgb(92 92 100))';
    promptCategory.style.marginTop = '20px';
    promptCategory.style.padding = '5px';
    promptCategory.style.color = 'white';

    itemContainer.appendChild(promptCategory);
    itemContainer.appendChild(listItem);
    listItem.appendChild(divAcoes);
    if(isUser) {
      divAcoes.appendChild(removeButton);
      divAcoes.appendChild(editButton);
    

    }
 
    return itemContainer;
  }

  function handleCloseButtonClick() {
    toggleSidebar();
  }

  function toggleSidebar() {
    sidebarContainer.classList.toggle('open');
    closeButton.textContent = sidebarContainer.classList.contains('open') ? 'Fechar' : 'Abrir';
  }

  function handleAddButtonClick() {
    if (mode==="edit"){
   // procura editItemName no storage e substitui pelo novo valor
   const itemIndex = parsedItems.findIndex(item => item.prompt === editItemName.prompt);
    parsedItems[itemIndex].prompt = newItemInput.value.trim();
    parsedItems[itemIndex].title = newItemTitle.value.trim();
    localStorage.setItem('listItems', JSON.stringify(parsedItems));
    tabLoadUserPrompts();
    mode='add';
    const button = document.getElementById('add-button');
    button.textContent = "Adicionar";
    newItemInput.value = '';
    newItemTitle.value = '';
    document.getElementById('cancel-button').remove();
    } else {

    const newItemText = newItemInput.value.trim();
    let itemJSON = { title: newItemTitle.value, prompt: newItemText };
    if(newItemText !== '' && newItemTitle.value !== '') {
      const newItem = createListItem(itemJSON);
      newItem.addEventListener('click', (event) => handleListItemClick(event, newItemText));
      listContainer.appendChild(newItem);
      newItemInput.value = '';
      newItemTitle.value = '';
      // Save the updated list items to localStorage
      parsedItems.push(itemJSON);
      localStorage.setItem('listItems',JSON.stringify(parsedItems));
    
  } 
  //else alert("Digite um titulo e prompt")
}
  }

  function handleRemoveButtonClick(e, itemName) {
    e.stopPropagation()
    const itemIndex = parsedItems.indexOf(itemName);
    parsedItems.splice(itemIndex, 1);
    localStorage.setItem('listItems', JSON.stringify(parsedItems));
    tabLoadUserPrompts();
  }

  function handleEditButtonClick(e, item) {
    e.stopPropagation()
    mode = "edit";
    const textarea = document.getElementById('new-item-input');
    textarea.value = item.prompt;
    newItemTitle.value = item.title;
    const button = document.getElementById('add-button');
    button.textContent = "Salvar";
    editItemName = item;

    const cancelEditButton = document.createElement('button')
    cancelEditButton.textContent = 'Cancelar';
    cancelEditButton.classList.add('cancel-button');
    cancelEditButton.style.borderRadius = '5px';
    cancelEditButton.style.width = '100%';
    cancelEditButton.style.margin = '0px';
    cancelEditButton.style.marginTop = '10px';

    cancelEditButton.id = 'cancel-button';
    //adiciona cor de fundo do botão de editar na cor gradiente azul
    cancelEditButton.style.background = 'linear-gradient(to right, #a00000, #a00000)';
    cancelEditButton.onclick = () => {
      mode = "add";
      button.textContent = "Adicionar";
      textarea.value = '';
      cancelEditButton.remove();
    }
    sidebarContainer.appendChild(cancelEditButton);
  }

  function tabLoadUserPrompts() {
    listContainer.innerHTML = ''; 
    parsedItems.forEach((itemText) => {
      const listItem = createListItem(itemText);
      listItem.addEventListener('click', (event) => handleListItemClick(event, itemText.prompt));
      listContainer.appendChild(listItem);
    });
  }

  function tabFetchPrompts() {
    listContainer.innerHTML = '';

    fetch('https://raw.githubusercontent.com/danielmeloalencar/gpt-power/master/prompts.csv')
      .then((resp) => resp.text()) 
      .then((csvContent) => {
        const lines = csvContent.split('\n');
        const prompts = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line !== '') {
            const [act, prompt] = line.split('","').map((field) => field.replace(/"/g, ''));
            prompts.push({ act, prompt });
          }
        }

        for (const prompt of prompts) {
          const item = {title: prompt.act ,prompt: "Act: " + prompt.act + "\n Prompt: " + prompt.prompt + " \n\n"};
          const listItem = createListItem(item,false);
          listItem.addEventListener('click', (event) => handleListItemClick(event, item.prompt));
          listContainer.appendChild(listItem);
        }
      })
      .catch((ex) => {
        console.error(ex);
      });
  }
}
main();