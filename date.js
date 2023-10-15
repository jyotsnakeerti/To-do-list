// module.exports.getDate = getDate;    OR
exports.getdate = function(){
    var today = new Date();
    
    var options= {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    var day = today.toLocaleDateString("en-US", options);   // it will give today date with month and day
    return day;
}

//or function getdate(){  }


module.exports.getday = getday;

function getday(){
    var today = new Date();
    
    var options= {
        weekday: "long"
    };
    var day = today.toLocaleDateString("en-US", options);   // it will give today date with month and day
    return day;
}


