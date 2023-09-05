window.addEventListener('DOMContentLoaded', function () {
    //Ambil Data dari HTML
    const form = document.getElementById('form')

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const inputBookTitle = document.getElementById("inputBookTitle").value;
        const inputBookAuthor = document.getElementById("inputBookAuthor").value;
        const inputBookYear = document.getElementById("inputBookYear").value
        const isCompleted = document.getElementById("inputBookIsComplete").checked;
        addBook(inputBookTitle, inputBookAuthor, inputBookYear, isCompleted);
    })

    //Array untuk menyimpan Buku
    const bookshelf = [];

    //Buat Custom Event;
    const RENDER_BOOK = 'render-book';
    const SAVED_EVENT = 'saved-books';

    //Web Storage
    const STORAGE_KEY = 'BOOK_APPS';
    const CHANGED_FREQUENCY = 'DATA_CHANGED';

    //Tambahkan Buku
    const addBook = (title, author, year, isCompleted) => {
        const genId = generateId()
        const yearNumber = typeof year === 'string' ? parseInt(year) : year
        const bookObject = addBookObject(genId, title, author, yearNumber, isCompleted)

        if (isStorageExist()) {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const existingData = JSON.parse(data);
                // Append the new book to the existing data
                existingData.push(bookObject);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
            } else {
                // If no existing data, create a new array with the book
                localStorage.setItem(STORAGE_KEY, JSON.stringify([bookObject]));
            }
        }
    
        bookshelf.push(bookObject)
        dispatchRenderEvent()
        changedDataCount()
    }

    function addBookObject(id, title, author, year, isCompleted){
        return {
            id,
            title,
            author,
            year,
            isCompleted
        }
    }

    function generateId(){
        return +new Date()
    }

    //Render Buku
    document.addEventListener(RENDER_BOOK, () => {
        const unCompletedBook = document.getElementById('incompleteBookshelfList')
        unCompletedBook.innerHTML = ''

        const completedBook = document.getElementById('completeBookshelfList')
        completedBook.innerHTML = ''

        for (const books of bookshelf) {
            const makeElement = showBook(books)
            if (!books.isCompleted) {
                unCompletedBook.append(makeElement)
            } else {
                completedBook.append(makeElement)
            }
        }
    })

    function dispatchRenderEvent() {
        document.dispatchEvent(new Event(RENDER_BOOK));
    }

    //Buat Tampilan Buku 
    
    const showBook = (bookItem) => {
        //Buat Element Container untuk Buku 
        const container = document.createElement('div')
        container.classList.add('bookContainer')
        container.setAttribute("id", `book-${bookItem.title.split(' ').join('-').toLowerCase()}`);
        container.style.marginBlock = "10px"
        container.style.display = 'flex'
        container.style.flexDirection = 'row'
        container.style.borderBottom = "1px solid black"
    
        //Bagian Detil Buku
        const bookDesk = document.createElement('section')
        bookDesk.classList.add('book-details')
        bookDesk.style.flexGrow = '1'
    
        const bookTitle = document.createElement('h4')
        bookTitle.classList.add('title')
        bookTitle.innerText = bookItem.title

        const bookAuthor = document.createElement('p')
        bookAuthor.innerText = bookItem.author

        const bookYear = document.createElement('p')
        bookYear.innerText = bookItem.year

        const buttonContainer = document.createElement('section')
        buttonContainer.classList.add('button-container')

        //Masukan ke dalam container
        bookDesk.append(bookTitle, bookAuthor, bookYear)
        container.append(bookDesk, buttonContainer)

        if (bookItem.isCompleted) {
            //Undo Button
            const undoButton = document.createElement('button')
            undoButton.innerHTML = '<span class="material-symbols-outlined">undo</span>'
            undoButton.addEventListener('click', () => {
                undoCompletedBook(bookItem.id)
            })

            //Delete Button
            const deleteButton = document.createElement('button')
            deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>'
            deleteButton.addEventListener('click', () => {
                removeCompletedBook(bookItem.id)
            })

            buttonContainer.append(undoButton, deleteButton)

        }  else {
            const finishButton = document.createElement('button')
            finishButton.innerHTML = '<span class="material-symbols-outlined">check</span>'
            finishButton.addEventListener('click', () => {
                moveToCompletedBook(bookItem.id)
            })

            //Delete Button
            const deleteButton = document.createElement('button')
            deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>'
            deleteButton.addEventListener('click', () => {
                removeCompletedBook(bookItem.id)
            })

            buttonContainer.append(finishButton, deleteButton)
        }
        return container;
    }

    //Pindahkan Buku yang sudah di baca
    function moveToCompletedBook(id){
        const targetedBook = findBook(id)

        if(targetedBook === null) return;

        targetedBook.isCompleted = true
        dispatchRenderEvent()
        savedData()
        changedDataCount()
    }
    
    //Pindahkan Buku ke belum di baca
    function undoCompletedBook(id){
        const targetedBook = findBook(id)
        
        if(targetedBook === null) return;
        
        targetedBook.isCompleted = false
        dispatchRenderEvent()
        savedData()
        changedDataCount()
    }
    
    //Hapus Buku
    function removeCompletedBook(id){
        const targetedBook = findIndexBook(id)
        
        if (targetedBook === null) return;
        
        bookshelf.splice(targetedBook, 1)
        dispatchRenderEvent()
        savedData()
        changedDataCount()
    }
    
    //fungsi untuk mencari buku sesuai dengan id
    function findBook(id){
        for (const bookDatas of bookshelf) {
            if (bookDatas.id === id) {
                return bookDatas
            }
        }
        return null;
    }

    function findIndexBook(id){
        for (const index in bookshelf) {
            if (bookshelf[index].id === id) {
                return index
            }
        }
        return -1;
    }

    //Local Storage

    function savedData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(bookshelf);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event("SAVED_EVENT"));
        }
    }

    function loadDataFromStorage() {
        if (isStorageExist()) {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsedData = JSON.parse(data);
                bookshelf.length = 0; 
                bookshelf.push(...parsedData);
                dispatchRenderEvent();
            }
        }
    }


    //Mendefinisikan perubahan data yang dilakukan Web dalam satu kali membuka halaman
    function changedDataCount(){
        if (isStorageExist()) {
            let count = sessionStorage.getItem(CHANGED_FREQUENCY);
            count = count ? parseInt(count) : 0; 
            count++;
            sessionStorage.setItem(CHANGED_FREQUENCY, count);
        }
    }

    const isStorageExist = () => {
        if (typeof (Storage) === undefined) {
            alert('Web are not designed for Web Storage')
            return false
        }
        return true
    }

    //Fitur Search Book
    function searchBook() {
        const searchInput = document.getElementById("searchBookTitle").value;
        const bookContainers = document.querySelectorAll(".bookContainer");
        const searchResult = document.getElementById("searchResult");
        
        searchResult.innerHTML = '';
    
        for (const container of bookContainers) {
            const titleElement = container.querySelector(".title");
            const title = titleElement.innerText.toLowerCase();
    
            if (title.includes(searchInput.toLowerCase())) {
                container.style.display = "flex";
                container.style.width = "200px";
                searchResult.appendChild(container);
            } else {
                container.style.display = "none";
            }
        }
    }
    
    const searchForm = document.getElementById("searchBook");
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        searchBook();
    });

    loadDataFromStorage()
})