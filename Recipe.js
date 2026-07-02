const state = {
            favorites: JSON.parse(localStorage.getItem('gourmetFavs')) || [],
            currentView: 'search',
        };

        
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const recipeContainer = document.getElementById('recipeContainer');
          const modalOverlay = document.getElementById('modalOverlay');
        const modalBody = document.getElementById('modalBody');
     const closeModalBtn = document.getElementById('closeModal');
        const categoryContainer = document.getElementById('categoryContainer');
        const randomBtn = document.getElementById('randomBtn');
const themeToggle = document.getElementById('themeToggle');
        const viewBtns = document.querySelectorAll('.view-btn');
              const toast = document.getElementById('toast');

      
        document.addEventListener('DOMContentLoaded', () => {
            setupEventListeners();
            
            
            fetchCategories();
            
            
            fetchRecipes('Chicken');
        });

        
        function setupEventListeners() {
            searchBtn.addEventListener('click', handleSearch);
            searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
            closeModalBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (e) => e.target === modalOverlay && closeModal());
            
            randomBtn.addEventListener('click', async () => {
                showSkeleton();
                showToast('Finding a surprise...', 'info');
                try {
                    const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
                    const data = await res.json();
                    renderRecipes([data.meals[0]], true);
                } catch (err) {
                    console.error(err);
                    recipeContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center">Error fetching random meal.</div>';
                }
            });

            themeToggle.addEventListener('click', () => {
                const isDark = document.body.getAttribute('data-theme') === 'dark';
                document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
                themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
            });

            viewBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    viewBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    state.currentView = btn.dataset.view;
                    if(state.currentView === 'favorites') {
                        renderFavorites();
                        resetCategories(null); ry
                    } else {
                        if(searchInput.value) handleSearch();
                        else recipeContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;"><i class="fas fa-search fa-4x" style="margin-bottom:25px; opacity:0.2;"></i><h2 style="font-size:24px;">Search for a recipe</h2></div>`;
                    }
                });
            });
        }

      

        async function fetchCategories() {
            try {
                const res = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
                const data = await res.json();
                if (data.categories) {
                    renderCategories(data.categories);
                } else {
                    console.log("No categories found");
                }
            } catch (e) {
                console.log("Error loading categories", e);
            }
        }

        function renderCategories(categories) {
            
            const allBtn = document.createElement('button');
            allBtn.className = 'cat-btn active';
            allBtn.textContent = 'All';
            allBtn.addEventListener('click', (e) => {
                handleAllClick(e.target);
            });
            categoryContainer.appendChild(allBtn);

            
            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'cat-btn';
                btn.textContent = cat.strCategory;
                btn.addEventListener('click', () => {
                    
                    resetCategories(btn);
                   
                    filterByCategory(cat.strCategory);
                });
                categoryContainer.appendChild(btn);
            });
        }

        function handleAllClick(btn) {
            resetCategories(btn);
          
            state.currentView = 'search';
            viewBtns.forEach(b => b.classList.remove('active'));
            viewBtns[0].classList.add('active');
            
            
            searchInput.value = '';
            recipeContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;"><i class="fas fa-utensils fa-4x" style="margin-bottom:25px; opacity:0.2;"></i><h2 style="font-size:24px;">Select a category or search</h2></div>`;
        }

        function resetCategories(activeBtn) {
            const btns = categoryContainer.querySelectorAll('.cat-btn');
            btns.forEach(b => b.classList.remove('active'));
            if(activeBtn) activeBtn.classList.add('active');
        }

        async function filterByCategory(cat) {
            
            state.currentView = 'search';
            viewBtns.forEach(b => b.classList.remove('active'));
            viewBtns[0].classList.add('active'); 
            
            showSkeleton();
            try {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
                const data = await res.json();
                if(data.meals) renderRecipes(data.meals);
                else recipeContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;">No meals found for ${cat}</div>`;
            } catch(e) { console.error(e); }
        }

        

        async function fetchRecipes(query) {
            if(!query) return;
            showSkeleton();
            try {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
                const data = await res.json();
                if(data.meals) renderRecipes(data.meals);
                else {
                    recipeContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;">No recipes found for "${query}".</div>`;
                }
            } catch(e) { console.error(e); }
        }

        function handleSearch() {
            const query = searchInput.value.trim();
            state.currentView = 'search';
            viewBtns.forEach(b => b.classList.remove('active'));
            viewBtns[0].classList.add('active');
            resetCategories(null); 
            if(query) fetchRecipes(query);
        }

        function showSkeleton() {
            recipeContainer.innerHTML = '';
            for(let i=0; i<6; i++) {
                const skel = document.createElement('div');
                skel.className = 'skeleton';
                skel.innerHTML = `<div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text-short"></div>`;
                recipeContainer.appendChild(skel);
            }
        }

        function renderRecipes(meals, animate = false) {
            recipeContainer.innerHTML = '';
            
            meals.forEach((meal, index) => {
                const isFav = state.favorites.some(f => f.idMeal === meal.idMeal);
                
                const card = document.createElement('div');
                card.className = 'recipe-card';
                
                const delay = animate ? 0 : index * 100; 
                card.style.transitionDelay = `${delay}ms`;

                card.innerHTML = `
                    <div class="card-img-wrapper">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${meal.idMeal}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${meal.strMeal}</h3>
                        <div class="card-meta">
                            ${meal.strArea ? `<span><i class="fas fa-globe"></i> ${meal.strArea}</span>` : ''} 
                            ${meal.strCategory ? `<span style="margin-left:10px;">| <i class="fas fa-leaf"></i> ${meal.strCategory}</span>` : ''}
                        </div>
                        <button class="card-btn" onclick="openRecipe('${meal.idMeal}')">View Recipe</button>
                    </div>
                `;

                recipeContainer.appendChild(card);
                
                requestAnimationFrame(() => card.classList.add('show'));
            });
        }

        function renderFavorites() {
            recipeContainer.innerHTML = '';
            if(state.favorites.length === 0) {
                recipeContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                    <i class="far fa-sad-tear fa-4x" style="margin-bottom:25px; opacity:0.2;"></i>
                    <h2 style="font-size:24px;">No favorites yet!</h2>
                </div>`;
                return;
            }
            renderRecipes(state.favorites);
        }

        async function openRecipe(id) {
            try {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
                const data = await res.json();
                const meal = data.meals[0];
                
                let ingHtml = '';
                for(let i=1; i<=20; i++) {
                    if(meal[`strIngredient${i}`]) {
                        ingHtml += `<div class="ing-item"><i class="fas fa-check-circle"></i> ${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</div>`;
                    }
                }

                modalBody.innerHTML = `
                    <h2 class="modal-title">${meal.strMeal}</h2>
                    <div class="modal-tags">
                        ${meal.strArea ? `<span class="tag"><i class="fas fa-globe"></i> ${meal.strArea}</span>` : ''}
                        ${meal.strCategory ? `<span class="tag"><i class="fas fa-utensils"></i> ${meal.strCategory}</span>` : ''}
                        ${meal.strTags ? meal.strTags.split(',').map(t => `<span class="tag">#${t}</span>`).join('') : ''}
                    </div>
                    <img src="${meal.strMealThumb}" class="modal-img">
                    
                    <h3 class="modal-section-title">Ingredients</h3>
                    <div class="ing-list">${ingHtml}</div>
                    
                    <h3 class="modal-section-title">Instructions</h3>
                    <p class="inst-text">${meal.strInstructions}</p>
                    
                    ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="video-btn"><i class="fab fa-youtube"></i> Watch Video Tutorial</a>` : ''}
                `;
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } catch (e) { console.error(e); }
        }

        function closeModal() {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        async function toggleFavorite(id) {
            let meal = state.favorites.find(m => m.idMeal === id);
            
            if(meal) {
                state.favorites = state.favorites.filter(m => m.idMeal !== id);
                showToast('Removed from favorites', 'default');
            } else {
                try {
                    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
                    const data = await res.json();
                    if(data.meals) {
                        state.favorites.push(data.meals[0]);
                        showToast('Added to favorites', 'success');
                    }
                } catch(e) { console.log(e); }
            }
            
            localStorage.setItem('gourmetFavs', JSON.stringify(state.favorites));
            
            if(state.currentView === 'favorites') renderFavorites();
            else {
                const btn = document.querySelector(`button[onclick="event.stopPropagation(); toggleFavorite('${id}')"]`);
                if(btn) btn.classList.toggle('active');
            }
        }

        function showToast(msg) {
            const toastMsg = document.getElementById('toastMsg');
            toastMsg.textContent = msg;
            toast.classList.add('active');
            setTimeout(() => toast.classList.remove('active'), 3000);
        }
