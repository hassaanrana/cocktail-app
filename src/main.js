import { component, useState } from '@pionjs/pion';
import { html } from 'lit-html';

// toast component
function Toast({ message }) {
  return html`
    <div class="toast ${message ? 'show' : ''}">
      ${message}
    </div>
  `;
}

function CocktailApp() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [toast, setToast] = useState('');

  // print shopping list
  const printList = () => {
    // remove buttons
    const items = shoppingList.map(item => `<li>${item}</li>`).join('');

    const printWindow = window.open('', '', 'width=600,height=600');

    printWindow.document.write(`
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h2 { margin-top: 0; }
            ul { list-style: none; padding: 0; }
            li { padding: 6px 0; border-bottom: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <h2>Shopping List</h2>
          <ul>
            ${items}
          </ul>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();

  };

  // show toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // search cocktails
  const searchCocktails = async () => {
    if (!query.trim()) return;
    showToast('Searching...');
    try {
      const res = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`
      );
      const data = await res.json();
      if (data.drinks) {
        setResults(data.drinks);
        showToast('Here are the results.');
      } else {
        setResults([]);
        showToast('No results found.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error fetching data.');
    }
  };

  // add ingredients to shopping list
  const addToShoppingList = (drink) => {
    const ingredients = [];
    for (let i = 1; i <= Object.keys(drink).length; i++) {
      const ing = drink['strIngredient' + i];
      if (ing) ingredients.push(ing);
    }
    const newList = Array.from(new Set([...shoppingList, ...ingredients]));
    setShoppingList(newList);
    showToast('Ingredients added to shopping list.');
  };

  // remove ingredient
  const removeIngredient = (item) => {
    setShoppingList(shoppingList.filter((i) => i !== item));
    showToast('Ingredient removed from shopping list.');
  };

  return html`
    <style>
      body {
        font-family: sans-serif;
        margin: 0;
        background: #fafafa;
      }
      .container {
        padding: 20px;
      }
      .search-row {
        margin-bottom: 20px;
      }
      .search-bar {
        display: flex;
        gap: 8px;
        width: 100%;
      }
      .search-bar input {
        flex: 1;
        padding: 10px;
        font-size: 16px;
      }
      .search-bar button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
      }

      .content-row {
        display: flex;
        gap: 20px;
      }
      .left-panel {
        flex: 3;
      }
      .right-panel {
        flex: 2;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .results {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .result-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #fff;
        align-items: center;
      }
      .result-item img {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        object-fit: cover;
      }
      .result-info {
        flex: 1;
      }
      .result-info h3 {
        margin: 0 0 6px;
      }
      .result-info p {
        margin: 0;
        font-size: 14px;
        color: #555;
        max-height: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .add-btn {
        background: #28a745;
        border: none;
        color: white;
        font-size: 20px;
        width: 36px;
        height: 36px;
        border-radius: 5%;
        cursor: pointer;
      }
      .shopping-list h3 {
        margin-top: 0;
      }
      .shopping-list ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .shopping-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid #eee;
      }
      .remove-btn {
        background: #dc3545;
        border: none;
        border-radius: 5%;
        color: white;
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
      .print-btn {
        margin-top: 12px;
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5%;
        cursor: pointer;
      }
      .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #333;
        color: #fff;
        padding: 12px 18px;
        border-radius: 6px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
        pointer-events: none;
        z-index: 9999;
      }
      .toast.show {
        opacity: 1;
        transform: translateY(0);
      }
    </style>

    <div class="container">
    
      <div class="search-row">
        <div class="search-bar">
          <input 
            type="text" 
            .value=${query} 
            @input=${(e) => setQuery(e.target.value)} 
            placeholder="Search cocktails..." />
          <button @click=${searchCocktails}>Search</button>
        </div>
      </div>

      <div class="content-row">
        <div class="left-panel">
          <div class="results">
            ${results.map(
              (drink) => html`
                <div class="result-item">
                  <img src=${drink.strDrinkThumb} alt=${drink.strDrink} />
                  <div class="result-info">
                    <h3>${drink.strDrink}</h3>
                    <p>${drink.strInstructions}</p>
                  </div>
                  <button class="add-btn" @click=${() => addToShoppingList(drink)}>+</button>
                </div>
              `
            )}
          </div>
        </div>

        <div class="right-panel shopping-list">
          <h3>Shopping List</h3>
          <ul>
            ${shoppingList.map(
              (item) => html`
                <li>
                  <span>${item}</span>
                  <button class="remove-btn" @click=${() => removeIngredient(item)}>×</button>
                </li>
              `
            )}
          </ul>
          ${shoppingList.length > 0
            ? html`<button class="print-btn" @click=${printList}>Print</button>`
            : ''}
        </div>
      </div>
    </div>

    ${Toast({ message: toast })}
  `;
}

customElements.define('cocktail-app', component(CocktailApp));
