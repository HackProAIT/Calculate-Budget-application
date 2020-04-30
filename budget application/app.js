var budgetController = (function(){
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) *100);
        }
        else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        })
        
        data.totals[type] = sum;
    };



    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };

    return {
        addItem : function(type, des, val){
            var newItem, ID;
            
            if(data.allItems[type].length === 0){
                ID = 1;
            }
            else{
            ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }

            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type == 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem : function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);

            }

        },

        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentage(data.totals.inc);
            })
        },

        getPercentages : function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPercentages;
        },

        calculateBudget : function(){
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0)
              data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            else
              data.percentage = -1;

        },

        getBudget : function(){
            return{
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
            

        }
    };

})();

var UIController = (function (){
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expPercentageLabel : '.item__percentage',
        monthLabel : '.budget__title--month'
    }

    var nodeListForEach  = function(list, callback) {
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, intComma;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        intComma = int.substr(0, int.length % 3 === 0 ? 3 : int.length % 3);
        for(var i=int.length % 3 === 0 ? 3 : int.length % 3; i<int.length; i+=3){
            intComma+=',' + int.substr(i, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + intComma + '.' + dec;

    };

    return{
        getInput : function(){
            return{
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem : function(obj, type){
            var html,newHtml, element;

            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields : function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },

        displayBudget : function(obj){

            var type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0)
              document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            else
              document.querySelector(DOMStrings.percentageLabel).textContent = '--';
        },

        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expPercentageLabel);

            

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '--';
                }

            })
        },

        getMonth : function(){
            var now, month, year, date;
            now = new Date();
            var monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = monthName[now.getMonth()-1];
            year = now.getUTCFullYear();
            date = month + ' ' + year;
            document.querySelector(DOMStrings.monthLabel).textContent = date;
        },

        changeType : function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings : function(){
            return DOMStrings;
        }
    };

})();

var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListners = function(){
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keypress === 13 || event.which === 13){
                ctrlAddItem();
        }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }

    var updateBudget = function(){
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    }
   
    var updatePercentages = function(){
        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {
        var input, newItem;

        input = UIController.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            newItem = budgetController.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type)

            UICtrl.clearFields();

            updateBudget();

            updatePercentages();

        }
        
        //console.log(UIController.getInput());
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();
        }
    };

    

    return {
        init : function(){
            console.log('application has started');

            UICtrl.getMonth();

            setupEventListners();

            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : 0
            });
        }
    }    

})(budgetController, UIController);

controller.init();