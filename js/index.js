
const clearElement = (headerTab, tab) => {
    $(headerTab).removeClass('profile__header-item_active');
    $(tab).hide();
};
const displayElement = (activeHeader, activeTab) => {
    $(activeHeader).addClass('profile__header-item_active');
    $(activeTab).fadeIn('slow');
    $(activeTab).css('display', 'flex');
}
const clearList = (el) => {
    el.text("");
    el.css('display', 'none');
};
//создаем подгружаемый список 
const createList = (el, dataArr) => {
    $(el).autocomplete({
        source: dataArr,
        minLength: 0
    });
}
//загрузка JSON
const getJSON = () => {
    let dataJSON = {};
    $.getJSON("js/countries.json", (data) => {
        $.each(data, function (key, value) {
            dataJSON[key] = value;
        });
    });
    return dataJSON;
}
//загрузка списка стран и городов из глобального массива
const getListCities = (data, input, country) => {
    const cityArray = [];
    const inputArr = country !== undefined ? data[country] : Object.keys(data);
    if (inputArr) {
        inputArr.forEach(item => {
            if (item.search(input.val()) !== -1 && cityArray.length <= 10) {
                cityArray.push(item);
            }
        });
        createList($(input), cityArray);
    }
}
//регулярные выражения возвращаются в соответсвии с типом поля
const returnRegExp = (name, str) => {
    let regExp;
    if (name === 'user-first-name' || name === 'user-last-name') {
        regExp = /^[a-zA-Z']{3,}$/i;
    }
    else if (name === 'user-email') {
        regExp = /([\w_.-]+)@([\w-._]{2,})\.([a-z]{2,})/g
    }
    else if (name === 'user-login') {
        regExp = /^[a-z0-9 .-]{3,}$/i;
    }
    else if (name === 'user-password') {
        regExp = /^[a-zA-z0-9-.?!*$&();:'|+]{4,}$/i;
    }
    else if (name === 'user-country' || name === 'user-city') {
        regExp = /^[a-zA-Z- ']{4,}$/i;
    }
    else if (name === 'user-street') {
        regExp = /^[a-zA-Z, 0-9./'-]{5,}$/i;
    }
    else {
        regExp = /./i;
    }
    return regExp.test(str);

}
const validateInput = (inputs) => {
    let err = 0;
    for (let obj of inputs) {
        const res = returnRegExp($(obj).attr('name'), $(obj).val());
        if (!res) {
            $(obj).attr('class','invalid-input');
            $(obj).effect('shake', 500);
            err++;
        }
        else {
            $(obj).attr('class','valid-input');
            err--;
        }
    }
    return err === -inputs.length;
}
const createDialog = () => {
    const dialog = $("#dialog");
    dialog.text('');
    dialog.append($('<h3/>').text('Check your input data'));
    const inputData = $('.profile__form').find('input');
    for(let item of inputData){
        const p = $('<p/>');
        p.html(`<strong>${$(item).siblings('label').text()}</strong>: ${$(item).val()}`);
        dialog.append(p);
    }
    
    dialog.dialog({
        modal: true,     
        show: {
            effect: "fade",
            duration: 600
          },
          hide: {
            effect: "puff",
            duration: 200
          },
          buttons: {
            "All is correct": ()=>{
                dialog.dialog( "close" );
                //сбрасываем форму
                resetForm();
            },
            Cancel: () => {
              dialog.dialog( "close" );
              
            }
          }
    });
}
const resetForm = () => {
    $('.profile__form input').val('');
    $('.profile__form input').attr('class','');
    $('.profile__send-link').attr('class', 'profile__unsend-link');
}

$(document).ready(function () {
    const data = getJSON();

    let tabIndex = 0;
    const tab = $('.profile__tab'); //хранит массив вкладок
    const headerTab = $('.profile__header-item');//хранит массив заголовков
    const valid = {0:false,1:false};
    
    //формируем дату в поле input
    $('#data').datepicker({
        dateFormat: "dd.mm.yy",
        changeYear: true,
        yearRange: "1900:y"
    });

    //отображаем первую вкладку
    displayElement(headerTab[tabIndex], tab[tabIndex]);

    //клики по кнопке NEXT
    $('.profile__next-link').on('click', function () {
        valid[tabIndex] = validateInput($(tab[tabIndex]).find('.profile__form').find('input'));
        if (valid[tabIndex]) {
            //переход по вкладкам
            if (tabIndex < (tab.length - 1)) {
                clearElement(headerTab[tabIndex], $(this).parent('.profile__tab'));
                displayElement(headerTab[tabIndex + 1], tab[tabIndex + 1]);
                tabIndex++;
            }
        }
        //переходим на последнюю вкладку, при условии, что все поля на предыдущих заполнены
        const res = Object.values(valid).every(elem => elem);
        if (res) {
            $('.profile__unsend-link').attr('class', 'profile__send-link');
            //отправляем форму и чистим все поля при нажатии на BUILD
            $('.profile__send-link').on('click', function () {
                //проверка полей на валидацию
                const resolve = validateInput($(tab[tabIndex]).find('.profile__form').find('input'));
                if (resolve) {
                    //выводим диалоговое окно с веденными данными 
                    createDialog();
                    for(let n in valid){
                        valid[n] = false;
                    }
                }
            });
        }
        
    });
    //клики по заголовкам вкладок
    $('.profile__header-item').on('click', function () {
        tabIndex = $(this).attr('data-index') - 1;
        clearElement(headerTab, tab);
        displayElement(this, tab[tabIndex]);
    });
    //выбираем страну
    $('#country').on('keyup', function () {
        $(this).val() ? getListCities(data, $(this)) : clearList($(this).next('.list-load'));
    });
    //выбираем город
    $('#city').on('keyup', function () {
        $(this).val() ? getListCities(data, $(this), $('#country').val()) : clearList($(this).next('.list-load'));
    });
    $('input').on('focus', function(){
        $(this).attr('class','');
    });

});