const getHigherLevelListItem = element => element.parentNode.closest('.list__item');
const getSameLevelList = element => [...getHigherLevelListItem(element).children].find(element => element.classList.contains('list'));


const statefulElements = document.getElementsByClassName(
    'list__item_text'
  );
  const buttons = document.getElementsByClassName('button');
  const hasTagChildren = (element, tag) =>
    [...element.children]
      .map(element => element.tagName.toLowerCase())
      .includes(tag);

  const maxId = [...statefulElements].reduce(
    (acc, current) => {
      return Number(getHigherLevelListItem(current).id) > acc
        ? Number(current.parentNode.id)
        : acc
      },
    0
  );

  const makeCounter = () => {
    let counter = maxId + 1;
    return () => (counter = Number(counter) + 1);
  };

  const getMenuElementContentId = menuElement => {
    return `${menuElement.closest('.list__item').id}_content`;
  }

    const getContentHeadingId = menuElement => `${menuElement.id}_heading`;

  const makeId = makeCounter();

  const toggleFoldedState = element => {
    if (![...getHigherLevelListItem(element).children].map(( { tagName }) => tagName).includes('OL')) {
      return;
    }
    if (element.contentEditable === 'true') {
      return;
    }
    getSameLevelList(element) &&
      getSameLevelList(element).classList.toggle('hidden');
  };

  const setEndOfContenteditable = contentEditableElement => {
    let range;
    let selection;

    range = document.createRange();
    range.selectNodeContents(contentEditableElement);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const makeHandleClick = () => {
      let isDoubleClick = false;
      return event => {
        const timer = setTimeout(() => {
              !isDoubleClick && event.detail === 1 && toggleFoldedState(event.target);
              isDouble = false;
          }, 500)
          if(event.detail === 2) {
              isDouble = true;
              clearTimeout(timer);
              editElement(event.target)
          }
      }
  }

  const handleClick = makeHandleClick();

  const toggleButtonsVisibilityForElement = element => {
    const buttons = [...element.parentNode.children].filter(element =>
      element.classList.contains('button')
    );
    const isActive = element.classList.contains('active');
    buttons.forEach(button =>
      isActive
        ? button.classList.remove('hidden')
        : button.classList.add('hidden')
    );
  };

  const setActiveMenuElement = element => {
    const activeElement = document.querySelector('.active.list__item_text');

    activeElement && activeElement.classList.toggle('active');
    activeElement && getHeadingsTree(activeElement) && getHeadingsTree(activeElement).forEach(el => el.classList.toggle('active-predecessor'));
    element.classList.toggle('active');
    getHeadingsTree(element) && getHeadingsTree(element).forEach(el => el.classList.toggle('active-predecessor'));
    toggleButtonsVisibilityForElement(element);
    activeElement && toggleButtonsVisibilityForElement(activeElement);
  };

  const setActiveContent = currentMenuElement => {
    const activeMenuElement = document.querySelector(
      '.active.list__item_text'
    );
    const activeMenuElementContent =
      activeMenuElement &&
      document.getElementById(getMenuElementContentId(activeMenuElement));
    const currentMenuElementContent = document.getElementById(
      getMenuElementContentId(currentMenuElement)
    );

    activeMenuElement &&
      activeMenuElementContent.classList.add('hidden');
    activeMenuElementContent &&
      currentMenuElementContent.classList.remove('hidden');
  };

  const getHeadingsTree = heading => {
    const iter = (element, result) => {
        const nextListItem = element.closest('.list__item').parentNode.closest('.list__item');
        const nextHeading = nextListItem && document.querySelector(`#${CSS.escape(nextListItem.id)} .wrapper .list__item_text`);
        return nextListItem ? iter(nextHeading, [...result, nextHeading]): result;
};
return iter(heading, []);
  }


  const setupSidebarNavigation = () => {
    [...statefulElements].forEach(
      element => {
          element.addEventListener('click', event => handleOnClickElement(event));
      })
  }
  
    setupSidebarNavigation();

  const handleOnClickElement = event => {
    setActiveContent(event.target);
    setActiveMenuElement(event.target);
    handleClick(event);
  };

  
  const deleteElement = element => {
    const contentId = `${element.closest('.list__item').id}_content`;
    getHigherLevelListItem(element).remove();
    document.getElementById(contentId).remove();
    const mainHeading = document.querySelector(`#${CSS.escape(1)} .wrapper .list__item_text`)
    setActiveMenuElement(mainHeading);
    setActiveContent(mainHeading);
  };

  const editElement = element => {
    const setEditPossibility = isPossible => {
      if (isPossible) {
        element.contentEditable = true;
        element.focus();
        return;
      }
      element.contentEditable = false;
    };
    setEndOfContenteditable(element);
    setEditPossibility(true);
    element.onblur = () => {
      setEditPossibility(false);
      document.getElementById(getContentHeadingId(element.closest('.list__item'))).innerHTML = element.innerHTML;
    }
    element.onkeydown = event => {
      if (event.keyCode === 13) {
        setEditPossibility(false);
        document.getElementById(getContentHeadingId(element.closest('.list__item'))).innerHTML = element.innerHTML;
      }
    };
  };

  const setButtonsOnClickEvents = () => {
    const buttonsDeleteArray = [...buttons].filter(element =>
      element.classList.contains('button-delete')
    );
    const buttonsAddArray = [...buttons].filter(
      element =>
        element.classList.contains('button-add') ||
        element.classList.contains('button-add-child')
    );
    
    buttonsDeleteArray.forEach(
      button => (button.onclick = event => window.confirm('Вы уверены, что хотите удалить элемент?') && deleteElement(event.target))
    );

    buttonsAddArray.forEach(
      button =>
        (button.onclick = event => {
          const isAppendingChild = event.target.classList.contains('button-add-child');
          const parent = isAppendingChild
            ? event.target.closest('.list__item')
            : event.target.closest('.list').parentNode;
          const newChildren = makeMenuElement(parent);
          appendNewElement(parent, newChildren);
          const newContent = makeContent(newChildren.li);
          appendContent(newContent);
          const heading = document.querySelector('.active');
          heading &&
            heading.classList.contains('unfolded') &&
            toggleFoldedState(heading);
          newChildren.heading.addEventListener('click', event => handleOnClickElement(event));
          setActiveContent(newChildren.heading);
          setActiveMenuElement(newChildren.heading);
          editElement(newChildren.heading);
        })
    );
  };

  setButtonsOnClickEvents();

  const makeMenuElement = parent => {
    const newElementListLevel = () => {
      if (parent.classList.contains('aside')) {
        return 1;
      } else if (parent.classList.contains('level1-list__item')) {
        return 2;
      }
      return 3;
    };

    const newListItemData = {
      tag: 'li',
      class: `level${newElementListLevel()}-list__item list__item`,
      content: ''
    };

    const newButtonsData = [
      {
        tag: 'button',
        class: 'button button-add removable',
        content: '+'
      },
      {
        tag: 'button',
        class: 'button button-delete removable',
        content: '–'
      },
      {
        tag: 'button',
        class: 'button button-add-child removable',
        content: '+'
      }
    ];

    const newHeadingData = {
      tag: `h${newElementListLevel() + 1}`,
      class: `level${newElementListLevel()}-list__heading list__item_text editable`,
      content: ''
    };

    const newOlData = {
      tag: 'ol',
      class: `list level${newElementListLevel()}-list`,
      content: ''
    };

    const makeElement = elementData => {
      newElement = document.createElement(elementData.tag);
      if (elementData.tag === 'li') {
        newElement.setAttribute('id', makeId());
      }
      newElement.setAttribute('class', elementData.class);
      newElement.innerHTML = elementData.content;
      if (newElement.tag === 'h2' || newElement.tag) {
        newElement.setAttribute('contenteditable', true);
      }

      return newElement;
    };

    const newOl = !hasTagChildren(parent, 'ol') && makeElement(newOlData);
    const newListItem = makeElement(newListItemData);
    const newHeading = makeElement(newHeadingData);
    const newButtons = newButtonsData.map(buttonData =>
      makeElement(buttonData)
    );

    return {
      ol: !hasTagChildren(parent, 'ol') && newOl,
      li: newListItem,
      heading: newHeading,
      buttons: newButtons
    };
  };

  const appendNewElement = (listItem, newChildren) => {
    const existingOl = [...listItem.children].find(child =>
      child.classList.contains('list')
    );
    const newWrapper = document.createElement('div');
    newWrapper.setAttribute('class', 'wrapper');
    const ol = hasTagChildren(listItem, 'ol') ? existingOl : newChildren.ol;
    const li = ol.appendChild(newChildren.li);
    const wrapper = li.appendChild(newWrapper);
    newChildren.buttons.forEach(button => wrapper.appendChild(button));
    wrapper.appendChild(newChildren.heading);
    ol.appendChild(li);
    if (!hasTagChildren(listItem, 'ol')) {
      listItem.appendChild(ol);
    }
    setButtonsOnClickEvents();
    newChildren.heading.focus();
  };

  const makeContent = menuElement => {
    const newElement = document.createElement('div');
    newElement.classList.add('content');
    newElement.setAttribute('id', `${menuElement.id}_content`);
    const heading = document.createElement('h3');
    heading.classList.add('content__heading');
    heading.setAttribute('id', getContentHeadingId(menuElement));
    newElement.appendChild(heading);
    return newElement;
  };

  const appendContent = content =>
    document.querySelector('.section_content').appendChild(content);

  const buttonEditContent = document.querySelector(
    '.section_content__button-edit'
  );

  editContent = () => {
    const visibleContent = [
      ...document.getElementsByClassName('content')
    ].find(element => !element.classList.contains('hidden'));
    if (visibleContent) {
      visibleContent.contentEditable = 'true';
    }
    
    const headingId = `${visibleContent.id.slice(0,1)}_heading`;
    document.getElementById(headingId).contentEditable = false;
    setEndOfContenteditable(visibleContent);
    visibleContent.focus();
    visibleContent.addEventListener(
      'onblur',
      event => (event.target.contentEditable = 'false')
    );
  };

  buttonEditContent.onclick = () => editContent();

  const linkDownloadEditable = document.querySelector(
    '.link-download-editable'
  );
  const linkDownloadLocked = document.querySelector(
    '.link-download-locked'
  );

  linkDownloadLocked.onclick = function() {
    const clone = document.querySelector('html').cloneNode(true);
    const removableElements = clone.getElementsByClassName('removable');
    [...removableElements].forEach(element => element.remove());
    this.href =
    'data: application/html;charset=utf-8,' +
      encodeURIComponent(clone.innerHTML);
  };

  linkDownloadEditable.onclick = function() {
    const clone = document.querySelector('html').cloneNode(true);
    this.href =
      'data: application/html;charset=utf-8,' +
      encodeURIComponent(clone.innerHTML);
  };