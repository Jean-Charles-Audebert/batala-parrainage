document.addEventListener('DOMContentLoaded', function () {
    const togglePupitre = document.getElementById('togglePupitre');
    const membersList = document.getElementById('membersList');
    const drawButton = document.getElementById('drawButton');
    const resultDiv = document.getElementById('result');
    let anciens;
    let nouveaux;

    // Function to fetch members from JSON file
    async function fetchMembers(filename) {
        const response = await fetch(`data/${filename}.json`);
        const data = await response.json();
        return data;
    }

    // Function to group members by pupitre
    function groupMembersByPupitre(members) {
        const groupedMembers = {};
        members.forEach(member => {
            if (!groupedMembers[member.pupitre]) {
                groupedMembers[member.pupitre] = [];
            }
            groupedMembers[member.pupitre].push(member);
        });
        return groupedMembers;
    }

    // Function to display members list in two columns
    async function displayMembers() {
        anciens = await fetchMembers('anciens');
        nouveaux = await fetchMembers('nouveaux');

        // Group anciens by pupitre
        const anciensGrouped = groupMembersByPupitre(anciens);

        // Group nouveaux by pupitre
        const nouveauxGrouped = groupMembersByPupitre(nouveaux);

        // Display members in two columns
        displayGroupedMembers(anciensGrouped, 'Anciens', 'left');
        displayGroupedMembers(nouveauxGrouped, 'Nouveaux', 'right');

        console.log("anciensGrouped", anciensGrouped);
        console.log("nouveauxGrouped", nouveauxGrouped);
    }

    // Function to display grouped members with toggle switches
    function displayGroupedMembers(groupedMembers, title, column) {
        const columnDiv = document.createElement('div');
        columnDiv.className = `column ${column}`;

        const pupitreTitle = document.createElement('h2');
        pupitreTitle.innerText = title;
        columnDiv.appendChild(pupitreTitle);

        Object.entries(groupedMembers).forEach(([pupitre, members]) => {
            const pupitreTitle = document.createElement('h3');
            pupitreTitle.innerText = pupitre;
            columnDiv.appendChild(pupitreTitle);

            members.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-container';

                const toggleSwitch = document.createElement('label');
                toggleSwitch.className = 'toggle-switch';

                toggleSwitch.innerHTML = `
                    <input type="checkbox" class="memberToggleSwitch" checked>
                    <span class="slider round"></span>
                `;

                const memberName = document.createElement('span');
                memberName.className = 'member-name';
                memberName.innerText = member.nom;

                memberDiv.appendChild(toggleSwitch);
                memberDiv.appendChild(memberName);
                columnDiv.appendChild(memberDiv);
            });
        });

        membersList.appendChild(columnDiv);
    }

    function performDraw() {
        // Get selected Anciens and Nouveaux
        const selectedAnciens = [];
        const selectedNouveaux = [];

        // Iterate through all members
        const allMembers = Array.from(document.querySelectorAll('.member-container')).forEach(memberDiv => {
            const memberName = memberDiv.querySelector('.member-name').innerText;
            const isAncien = anciens.some(ancien => ancien.nom === memberName);

            if (memberDiv.querySelector('.memberToggleSwitch:checked')) {
                if (isAncien) {
                    selectedAnciens.push(memberName);
                } else {
                    selectedNouveaux.push(memberName);
                }
            }
        });

        console.log("selectedAnciens : ", selectedAnciens);
        console.log("selectedNouveaux : ", selectedNouveaux);

        // Check if "tenir compte du pupitre" is activated
        const considerPupitre = togglePupitre.checked;

        // Perform the draw logic
        const drawResult = considerPupitre
            ? drawWithPupitre(anciens, nouveaux, selectedAnciens, selectedNouveaux)
            : drawWithoutPupitre(anciens, selectedAnciens, nouveaux, selectedNouveaux);

        // Display the result
        displayResult(drawResult.newMembers, drawResult.parrains);

        // Open the modal
        openModal();
    }

    function openModal() {
        const modal = document.getElementById('myModal');
        modal.style.display = 'block';
    }

    function closeModal() {
        const modal = document.getElementById('myModal');
        modal.style.display = 'none';
    }

    // Function to perform draw with pupitre consideration
    function drawWithPupitre(anciens, nouveaux, selectedAnciens, selectedNouveaux) {
        const drawResult = {
            newMembers: [],
            parrains: [],
        };

        // Group les anciens par pupitre
        const anciensGrouped = groupMembersByPupitre(anciens);

        // Iterate through selectedNouveaux
        selectedNouveaux.forEach(nouveauName => {
            // Obtient le pupitre du nouveau
            const nouveauPupitre = nouveaux.find(nouveau => nouveau.nom === nouveauName).pupitre;

            // Obtient les anciens disponibles pour le pupitre du nouveau
            const availableAnciens = anciensGrouped[nouveauPupitre].filter(ancien =>
                selectedAnciens.includes(ancien.nom)
            );

            // Choisis aléatoirement un ancien parmi les disponibles
            const randomAncien = getRandomElement(availableAnciens);

            // Met à jour le résultat du tirage
            drawResult.newMembers.push(nouveauName);
            drawResult.parrains.push(randomAncien ? randomAncien.nom : "Aucun");
        });

        console.log("drawResult:", drawResult);

        return drawResult;
    }

    // Function to perform draw without pupitre consideration
    function drawWithoutPupitre(anciens, selectedAnciens, nouveaux, selectedNouveaux) {
        const drawResult = {
            newMembers: [],
            parrains: [],
        };

        // Iterate through selectedNouveaux
        selectedNouveaux.forEach(nouveauName => {
            // Randomly choose an ancien from selectedAnciens
            const randomAncien = getRandomElement(selectedAnciens);

            // Update draw result
            drawResult.newMembers.push(nouveauName);
            drawResult.parrains.push(randomAncien ? randomAncien : "Aucun");
        });

        console.log("drawResult:", drawResult);

        return drawResult;
    }

    // Function to get a random element from an array
    function getRandomElement(array) {
        if (array && array.length > 0) {
            return array[Math.floor(Math.random() * array.length)];
        } else {
            return null; // or handle the case when the array is empty
        }
    }
    // Function to display the result
    function displayResult(newMembers, parrains) {
        console.log("newMembers:", newMembers);
        console.log("parrains:", parrains);
        resultDiv.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nouveau</th>
                        <th>Parrain</th>
                    </tr>
                </thead>
                <tbody>
                    ${newMembers.map((newMember, index) => `
                        <tr>
                            <td>${newMember}</td>
                            <td>${parrains[index]}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Event listener for draw button click
    drawButton.addEventListener('click', performDraw);

    // Initialize the application
    displayMembers();

    // Event listener to close the modal
    const closeModalButton = document.querySelector('.close');
    closeModalButton.addEventListener('click', closeModal);

    // Event listener for export button click
    const exportButton = document.getElementById('exportButton');
    exportButton.addEventListener('click', exportToPDF);
});

// Fonction pour exporter en PDF
function exportToPDF() {
    // Récupérer le contenu du tableau des résultats
    const tableContent = document.getElementById('result').innerHTML;

    // Initialiser jsPDF
    const pdf = new jsPDF();

    // Ajouter le contenu du tableau au PDF
    pdf.text('Résultats du tirage', 10, 10);
    pdf.fromHTML(tableContent, 10, 20);

    // Sauvegarder le PDF avec un nom de fichier
    pdf.save('resultats_tirage.pdf');
}