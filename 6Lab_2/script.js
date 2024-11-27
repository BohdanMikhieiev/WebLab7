const menuContainer = document.getElementById('menu-container');
const apiUrl = "https://your-api-url/api/Dropdown";

async function loadData() {
    const response = await fetch(apiUrl);
    const menus = await response.json();

    menuContainer.innerHTML = '';
    menus.forEach(menu => {
        const menuDiv = document.createElement('div');
        menuDiv.innerHTML = `
                    <h3>${menu.title}</h3>
                    <ul>
                        ${menu.options.map(option => `<li><a href="${option.link}">${option.name}</a></li>`).join('')}
                    </ul>
                `;
        menuContainer.appendChild(menuDiv);
    });
}

setInterval(loadData, 5000); // Refresh every 5 seconds
loadData();