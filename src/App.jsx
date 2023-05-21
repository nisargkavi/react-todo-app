import React , { useState , useEffect } from 'react'
import './App.css';
import { AiTwotoneDelete, AiTwotoneEdit, AiFillCloseCircle } from 'react-icons/ai';
import toast, { Toaster } from 'react-hot-toast';

function getCurrentDate(date) {
  const currentDate = new Date(date);

  // Get hours in 12-hour format
  let hours = currentDate.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12; // 0 should be converted to 12

  // Get minutes and pad with leading zero if necessary
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');

  // Get month, day, and year
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  const year = currentDate.getFullYear();

  // Combine the components into the desired format
  const formattedDate = `${hours}:${minutes} ${ampm}, ${month}/${day}/${year}`;

  return formattedDate;
}

function App() {
  const getLocalStorage = () => {
    let list = JSON.parse(localStorage.getItem('todoData'));
    if(list) {
      return list;
    } else {
      return [];
    }
  }
  const [todoList, setTodoList] = useState(getLocalStorage());
  const [FormTodoData, setFormTodoData] = useState({
    todoTitle: "",
    todoType: "incomplete",
    time: ""
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [filter,setFilter] = useState('All');

  const handleModalOpen = () => {
    setModalOpen(true);
  }
  const handleModalClose = () => {
    setModalOpen(false);
  }

  const handleEditModalOpen = (index) => {
    setEditModalOpen(true);
    setEditIndex(index);
    const { todoTitle , todoType } = todoList[index];
    setFormTodoData({
      todoTitle: todoTitle,
      todoType: todoType,
      time: new Date(),
    });
  }
  const handleEditModalClose = () => {
    setEditModalOpen(false);
  }


  function handleFormChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setFormTodoData((todoData) => ({
      ...todoData,
      [name]: value,
      time: new Date(),
    }));
  }

  const handleFilter = (e) => {
    setFilter(e.target.value);
    const filterText = e.target.value;
    toast(`Filter Updated to ${filterText.toUpperCase()}`, {
      icon: '🔁',
    });
  }

  const addToTODOList = () => {
    if (FormTodoData.todoTitle == '') {
      console.log('here');
      toast.error("Please enter a task")
      return;
    }
    const newTodoItem = {
      ...FormTodoData,
    };

    setTodoList((prevTodoList) => [...prevTodoList, newTodoItem]);
    setFormTodoData({
      todoTitle: '',
      todoType: 'incomplete',
      time: '',
    });
    handleModalClose();
  };

  const editToTODOList = () => {
    if (editIndex !== -1) {
      const { todoTitle , todoType } = todoList[editIndex];
      if (FormTodoData.todoTitle == '') {
        toast.error("Please enter a task")
        return;
      }
      if (todoTitle == FormTodoData.todoTitle && todoType == FormTodoData.todoType) {
        toast.error("No changes made!")
        return;
      }
      const updatedTodoList = [...todoList];
      updatedTodoList[editIndex] = FormTodoData;
      setTodoList(updatedTodoList);
      setEditIndex(-1);
    } else {
      toast.error("Something went wrong!")
    }
    handleEditModalClose();
  };

  const deleteFromTODOList = (index) => {
    const updatedTodoList = [...todoList];
    updatedTodoList.splice(index, 1);
    setTodoList(updatedTodoList);
    toast.success("Todo Deleted!")
  };

  const list = todoList.filter(todoItem => filter === 'All' || filter === todoItem.todoType);

  const handleTaskCompletion = (elem,index) => {
    const updatedTodoList = [...todoList];
    if(elem.target.attributes[1].value != 'checked') {
      updatedTodoList[index].todoType = 'complete';
      setTodoList(updatedTodoList);    
    } else {
      updatedTodoList[index].todoType = 'incomplete';
      setTodoList(updatedTodoList);    
    }
  }

  useEffect(() => {
    localStorage.setItem('todoData', JSON.stringify(todoList));
  }, [todoList]);

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className='container'>
        <p className="heading">TODO List</p>
        <div className='appButtonsWrapper'>
          <button type="button" className='appButton' onClick={() => handleModalOpen()}>Add Task</button>
          <select className='appSelector' id='taskStatusSelector' onChange={(e) => handleFilter(e)}>
            <option value="All">All</option>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Completed</option>
          </select>
        </div>
        <div className='todoContentWrapper'>
          {(todoList.length == 0 || list.length === 0) && <p className='todoItemWrapper' style={{justifyContent:'center',maxWidth: '200px',margin: 'auto'}}>No Todos!</p>}
          {todoList.filter(todoItem => filter === 'All' || filter === todoItem.todoType).map((todoItem, index) => ( 
            <div className='todoItemWrapper' key={index}>
              <div className='todoItemDetails'>
                <div className="checkboxWrapper">
                  <input className="checkbox__input" data-checked={todoItem.todoType == 'complete' ? "checked" : "unchecked"} type="checkbox" onClick={(e) => handleTaskCompletion(e,index)}/>
                  <svg className="checkbox__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                    <rect width="21" height="21" x=".5" y=".5" fill="#dedfe1" rx="3" />
                    <path className={todoItem.todoType != 'complete' ? "untick" : "tick"} stroke="#6EA340" fill="none" strokeLinecap="round" strokeWidth="4" d="M4 10l5 5 9-9" />
                  </svg>
                  <div>
                    {todoItem.todoType == 'complete' ? <p className="todoTitle completed">{todoItem.todoTitle}</p> : <p className="todoTitle">{todoItem.todoTitle}</p>}
                    {/* <p className="todoTime">{format(new Date(todoItem.time), 'p, MM/dd/yyyy')}</p> */}
                    <p className="todoTime">{getCurrentDate(todoItem.time)}</p>
                  </div>
                </div>
              </div>
              <div className='todoItemActions'>
                <div className='todoItemIcon' onClick={() => deleteFromTODOList(index)}>
                  <AiTwotoneDelete />
                </div>
                <div className='todoItemIcon' onClick={() => handleEditModalOpen(index)}>
                  <AiTwotoneEdit />
                </div>
              </div>
            </div>
           ))}
        </div>
      </div>
      <div className='creditWrapper'>
        <p onClick={() => window.open('https://nisargkavi.in', '_blank')}>Created By <span>Nisarg Kavi</span></p>
      </div>



      {modalOpen &&
        <div className="modalWrapper">
          <div className='modalContainer'>
            <div className="modalHeader">
              <div className='modalHeading'>Add Task?</div>
              <div className='modalCloseBtn' onClick={handleModalClose}><AiFillCloseCircle /></div>
            </div>
            <div className='modalContent'>
              <form className='modalForm'>
                <label htmlFor="todoTitle">Title</label>
                <input type="text" name="todoTitle" id="todoTitle" autoComplete='off' value={FormTodoData.todoTitle} onInput={handleFormChange}/>
                <label htmlFor="todoType">Status</label>
                <select id="todoType" name='todoType' autoComplete='off' value={FormTodoData.todoType} onChange={handleFormChange}>
                  <option value="incomplete">Incomplete</option>
                  <option value="complete">Completed</option>
                </select>

                <div className="modalButtonContainer">
                  <button type="button" className="appButton appTheme" onClick={addToTODOList}>Add Task</button>
                  <button type="button" className="appButton" onClick={handleModalClose}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      {editModalOpen &&
        <div className="modalWrapper">
          <div className='modalContainer'>
            <div className="modalHeader">
              <div className='modalHeading'>Edit Task?</div>
              <div className='modalCloseBtn' onClick={handleEditModalClose}><AiFillCloseCircle /></div>
            </div>
            <div className='modalContent'>
              <form className='modalForm'>
                <label htmlFor="todoTitle">Title</label>
                <input type="text" name="todoTitle" id="todoTitle" autoComplete='off' value={FormTodoData.todoTitle} onInput={handleFormChange}/>
                <label htmlFor="todoType">Status</label>
                <select id="todoType" name='todoType' autoComplete='off' value={FormTodoData.todoType} onChange={handleFormChange}>
                  <option value="incomplete">Incomplete</option>
                  <option value="complete">Completed</option>
                </select>

                <div className="modalButtonContainer">
                  <button type="button" className="appButton appTheme" onClick={editToTODOList}>Edit Task</button>
                  <button type="button" className="appButton" onClick={handleEditModalClose}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default App
