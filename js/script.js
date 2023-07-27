const books = [];
const RENDER_EVENT = 'render-book';
const RENDER_SEARCH_EVENT = 'render-search-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

const TEXT_CHECKED = 'Sudah selesai dibaca';
const TEXT_UNCHECKED = 'Belum selesai dibaca';

let snackbarTimeout = undefined;

let sections = {};

document.addEventListener('DOMContentLoaded', () => {
  const inputSection = document.querySelector('.input_section');
  const searchSection = document.querySelector('.search_section');
  const incompleteSection = document.querySelector('#incomplete');
  const completeSection = document.querySelector('#complete');

  const homeButton = document.querySelector('.home_button');
  const addButton = document.querySelector('.add_button');
  const unreadButton = document.querySelector('.unread_button');
  const readButton = document.querySelector('.read_button');

  sections = {
    'home': {
      button: homeButton,
      hide: [inputSection],
      show: [searchSection, incompleteSection, completeSection],
    },
    'add': {
      button: addButton,
      hide: [searchSection, incompleteSection, completeSection],
      show: [inputSection],
    },
    'unread': {
      button: unreadButton,
      hide: [inputSection, completeSection],
      show: [searchSection, incompleteSection],
    },
    'read': {
      button: readButton,
      hide: [inputSection, incompleteSection],
      show: [searchSection, completeSection],
    },
  };

  Object.values(sections).forEach((section) => {
    section.button.addEventListener('click', () => {
      onButtonClick({ button: section.button, sectionsToHide: section.hide, sectionsToShow: section.show });
    });
  });

  // Setting the default state to 'home'
  onButtonClick({ button: homeButton, sectionsToHide: sections.home.hide, sectionsToShow: sections.home.show });

  // Form
  const submitForm = document.querySelector('#input');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.querySelector('#searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  // Checkbox
  const spanSubmit = document.querySelector('#bookSubmit span');
  const checkboxInput = document.querySelector('#inputBookIsComplete');
  checkboxInput.addEventListener('change', function (event) {
    spanSubmit.innerHTML = event.target.checked ? TEXT_CHECKED : TEXT_UNCHECKED;
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function setActiveButton(activeButton) {
  Object.values(sections).forEach((section) => {
    section.button.classList.toggle('active', section.button === activeButton);
  });
}

function hideSections(sectionsToHide) {
  sectionsToHide.forEach((section) => section.classList.add('hidden'));
}

function showSections(sectionsToShow) {
  sectionsToShow.forEach((section) => section.classList.remove('hidden'));
}

function onButtonClick({ button, sectionsToHide, sectionsToShow }) {
  setActiveButton(button);
  hideSections(sectionsToHide);
  showSections(sectionsToShow);
}

function generateId() {
  return +new Date();
};

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
};

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
};

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

function loadDataFromStorage() {
  const serializeData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializeData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

function snackbar(message) {
  const snackbar = document.querySelector('#snackbar');

  if (snackbarTimeout !== undefined) {
    clearTimeout(snackbarTimeout);
  }

  snackbar.classList.add('show');
  snackbar.innerHTML = message;

  snackbarTimeout = setTimeout(() => snackbar.classList.remove('show'), 3000);
}

function addBook() {
  const title = document.querySelector('.input_section__title');

  const idBook = document.querySelector('#inputBookId');
  const titleBook = document.querySelector('#inputBookTitle');
  const authorBook = document.querySelector('#inputBookAuthor');
  const yearBook = document.querySelector('#inputBookYear');
  const isCompleteBook = document.querySelector('#inputBookIsComplete');

  if (isNaN(parseInt(idBook.value))) {
    const generateID = generateId();
    const bookObject = generateBookObject(generateID, titleBook.value, authorBook.value, parseInt(yearBook.value), isCompleteBook.checked);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    snackbar(`Buku ${bookObject.title} telah ditambahkan`);
  } else {
    const bookTarget = findBook(parseInt(idBook.value));

    if (bookTarget == undefined) return;

    bookTarget.title = titleBook.value;
    bookTarget.author = authorBook.value;
    bookTarget.year = parseInt(yearBook.value);
    bookTarget.isComplete = isCompleteBook.checked;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    snackbar(`Buku ${bookTarget.title} telah diubah`);

    title.innerHTML = 'Masukkan Buku Baru';
  }

  idBook.value = undefined;
  titleBook.value = '';
  authorBook.value = '';
  yearBook.value = '';
  isCompleteBook.checked = false;
};

function editBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == undefined) return;

  const title = document.querySelector('.input_section__title');

  const idBook = document.querySelector('#inputBookId');
  const titleBook = document.querySelector('#inputBookTitle');
  const authorBook = document.querySelector('#inputBookAuthor');
  const yearBook = document.querySelector('#inputBookYear');
  const isCompleteBook = document.querySelector('#inputBookIsComplete');

  const spanSubmit = document.querySelector('#bookSubmit span');

  // change UI
  onButtonClick({ button: sections.add, sectionsToHide: sections.add.hide, sectionsToShow: sections.add.show });

  title.innerHTML = `Edit Buku ${bookTarget.title}`

  idBook.value = bookTarget.id;
  titleBook.value = bookTarget.title;
  authorBook.value = bookTarget.author;
  yearBook.value = bookTarget.year;
  isCompleteBook.checked = bookTarget.isComplete;

  spanSubmit.innerHTML = isCompleteBook.checked ? TEXT_CHECKED : TEXT_UNCHECKED;
}

function searchBook() {
  const queryTitleBook = document.querySelector('#searchBookTitle').value;

  if (queryTitleBook.length > 0) {
    document.dispatchEvent(new Event(RENDER_SEARCH_EVENT));
  } else {
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

function findBook(bookId) {
  return books.find(book => book.id === bookId);
};

function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId);
};

function addBookToRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == undefined) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  snackbar(`Buku ${bookTarget.title} telah ditandai sudah dibaca`);
};

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  snackbar('Buku telah dihapus');
};

function undoBookFromRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == undefined) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  snackbar(`Buku ${bookTarget.title} telah ditandai belum dibaca`);
};

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${bookObject.year}`;

  // div .book_item__inner-content
  const innerContentContainer = document.createElement('div');
  innerContentContainer.classList.add('book_item__inner-content');
  innerContentContainer.append(textTitle, textAuthor, textYear);

  const editButton = document.createElement('button');
  editButton.setAttribute('type', 'button');
  editButton.setAttribute('aria-label', 'edit');
  editButton.classList.add('primary', 'edit_button');

  editButton.addEventListener('click', () => {
    editBook(bookObject.id);
  });

  // div .book_item__inner
  const innerContainer = document.createElement('div');
  innerContainer.classList.add('book_item__inner');
  innerContainer.append(innerContentContainer, editButton);

  //  div .action
  const actionContainer = document.createElement('div');
  actionContainer.classList.add('action');

  if (bookObject.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.setAttribute('type', 'button');
    undoButton.setAttribute('aria-label', 'undo');
    undoButton.classList.add('green', 'undo_button');

    undoButton.addEventListener('click', () => {
      undoBookFromRead(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.setAttribute('type', 'button');
    trashButton.setAttribute('aria-label', 'trash');
    trashButton.classList.add('red', 'trash_button');

    trashButton.addEventListener('click', () => {
      removeBook(bookObject.id);
    });

    actionContainer.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.setAttribute('type', 'button');
    checkButton.setAttribute('aria-label', 'check');
    checkButton.classList.add('green', 'check_button');

    checkButton.addEventListener('click', () => {
      addBookToRead(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.setAttribute('type', 'button');
    trashButton.setAttribute('aria-label', 'trash');
    trashButton.classList.add('red', 'trash_button');

    trashButton.addEventListener('click', () => {
      removeBook(bookObject.id);
    });

    actionContainer.append(checkButton, trashButton);
  }

  // article .book_item
  const container = document.createElement('article');
  container.setAttribute('id', `book-${bookObject.id}`);
  container.classList.add('book_item');
  container.append(innerContainer, actionContainer);

  return container;
};

document.addEventListener(RENDER_EVENT, () => {
  const unreadBookList = document.querySelector('#incompleteBookshelfList');
  unreadBookList.innerHTML = '';

  const readBookList = document.querySelector('#completeBookshelfList');
  readBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isComplete) {
      unreadBookList.append(bookElement);
    } else {
      readBookList.append(bookElement);
    }
  }
});

document.addEventListener(RENDER_SEARCH_EVENT, () => {
  const unreadBookList = document.querySelector('#incompleteBookshelfList');
  unreadBookList.innerHTML = '';

  const readBookList = document.querySelector('#completeBookshelfList');
  readBookList.innerHTML = '';

  const queryTitleBook = document.querySelector('#searchBookTitle').value;

  for (const bookItem of books.filter((book) => book.title.toLowerCase().includes(queryTitleBook.toLowerCase()))) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isComplete) {
      unreadBookList.append(bookElement);
    } else {
      readBookList.append(bookElement);
    }
  }
});
