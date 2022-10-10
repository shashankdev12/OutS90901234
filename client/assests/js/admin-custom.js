$(document).ready(function()
{
  if($('#registration').length > 0)
  {
      $('#registration').validate();
      $('#user_name').rules("add",{
          required:true,
          messages:{required:"Please Enter Your Username"},
          minlength: 4
      });
      $('#full_name').rules("add",{
          required:true,
          messages:{required:"Please Enter Full Name"}
      });
      $('#sponsor').rules("add",{
          required:true,
          messages:{required:"Please Select Sponsor"}
      });
      $('#dob').rules("add",{
          required:true,
          messages:{required:"Please Select date of birth"}
      });

      $('#email_address').rules("add",{
          required:true,
          email:true,
          messages:{required:"Please Enter Your Email Address",
                    email: "Please enter valid email e.g. name@domain.com"}
          });
      $('#pass').rules("add",{
          required:true,
          messages:{required:"Please Enter Password"},
          minlength: 5
            });
      $('#confirm_pwd').rules("add",{
          required:true,
          equalTo: '#pass',
          messages:{required:"Please Re-enter Password",
                    equalTo: "Password do not match"}
          });
      $('#termCon').rules("add",{
          required:true,
          messages:{required:"Please Check the term and policy"}
      });
  }


  /* change Profile Password*/

  if($('#changeProfilePassword').length > 0)
  {
      $('#changeProfilePassword').validate();

      $('#currentPassword').rules("add",{
          required:true,
          messages:{required:"Please Enter Current Password"}
          });
      $('#pass').rules("add",{
          required:true,
          messages:{required:"Please Enter Password"}
          });
      $('#confirmPass').rules("add",{
          required:true,
          equalTo: '#pass',
          messages:{required:"Please Re-enter Password",
                    equalTo: "Password do not match"}
          });
  }

  /* Forgot Password */

  if($('#frgtPsrd').length > 0)
  {
      $('#frgtPsrd').validate();
      $('#emailAddId').rules("add",{
          required:true,
          email:true,
          messages:{required:"Please Enter Your Email Address",
                    email: "Please enter valid email e.g. name@domain.com"}
          });
  }


  if($('#login').length > 0)
  {
    $('#login').validate();
    $('#username').rules("add",{
        required:true,
        messages:{required:"Enter Username"}
    });

    $('#password').rules("add",{
        required:true,
        messages:{required:"Enter Password"}
        });
  }


  if($('#adminLngForm').length > 0)
  {
      $('#adminLngForm').validate();
      $('#username').rules("add",{
          required:true,
          messages:{required:"Enter Username"}
      });

      $('#pass').rules("add",{
          required:true,
          messages:{required:"Enter Password"}
          });
  }



  /* Distributor Validation */

  if($('#distributorForm').length > 0)
  {
      $('#distributorForm').validate();
      $('#country').rules("add",{
          required:true,
          messages:{required:"Select Country"}
      });
      $('#distributor').rules("add",{
          required:true,
          messages:{required:"Enter Distributor Name"}
      });
  }


  /* Distributor Validation */

  if($('#distributorForm').length > 0)
  {
      $('#distributorForm').validate();
      $('#country').rules("add",{
          required:true,
          messages:{required:"Select Country"}
      });
      $('#distributor').rules("add",{
          required:true,
          messages:{required:"Enter Distributor Name"}
      });
  }

  /* CSV Validation */

  if($('#csvForm').length > 0)
  {
      $('#csvForm').validate();

      $('#xls').rules("add",{
          required:true,
          messages:{required:"Please select CSV File"}
      });
      $('#packages').rules("add",{
          required:true,
          messages:{required:"Please select package"}
      });
  }





  /* =============== Validation for competition ===================*/

  if($('#competition').length > 0)
  {
      $('#competition').validate();
      $('#compName').rules("add",{
          required:true,
          messages:{required:"Enter Competition Name"}
      });
      $('#game').rules("add",{
          required:true,
          messages:{required:"Select game"}
      });
      $('#cost').rules("add",{
          required:true,
          messages:{required:"Enter Cost of Competition"}
      });
      $('#startTime').rules("add",{
          required:true,
          messages:{required:"Enter Start Time of Competition"}
      });
      $('#endTime').rules("add",{
          required:true,
          messages:{required:"Enter End Time of Competition"}
      });
  }

  /* =============== Validation for Token ===================*/

  if($('#tokenForm').length > 0)
  {
      $('#tokenForm').validate();
      $('#token').rules("add",{
          required:true,
          messages:{required:"Enter Token"}
      });
      $('#cost').rules("add",{
          required:true,
          messages:{required:"Select cost"}
      });
  }

  /* admin change password*/

  if($('#changePassword').length > 0)
  {
    $('#changePassword').validate();
    $('#newPassword').rules("add",
    {
      required:true,
      messages:{required:"Please Enter Password"},
      minlength: 5
    });
    $('#confirmPassword').rules("add",
    {
      required:true,
      equalTo: '#newPassword',
      messages:{required:"Please Re-enter Password",
                equalTo: "Password do not match"}
      });
  }

});



/* Game enable Disable*/

function gameEnableDisable(id,status,web)
{
  var webURL =  web;
    $.ajax({
      type: "POST",
      url: webURL+'game/enableDisable',
      data: 'id='+id+'&status='+status,
      success: function(data)
      {
        location.reload();
      }
    });
}


/* validate Country */

if($('#countryData').length > 0)
{
  $('#countryData').validate();
  $('#countryName').rules("add",
  {
    required:true,
    messages:{required:"Please Enter Country Name"},
  });

  $('#countryCode').rules("add",
  {
    required:true,
    messages:{required:"Please Enter Country Code"},
    maxlength: 5
  });
}


/* validate licence */

if($('#licence').length > 0)
{
  $('#licence').validate();
  $('#count').rules("add",
  {
    required:true,
    messages:{required:"Please Enter Number of Licence want to generate."},
  });
  $('#country_id').rules("add",
  {
    required:true,
    messages:{required:"Please select country."},
  });
  $('#distributor').rules("add",
  {
    required:true,
    messages:{required:"Please select country and then select distributor"},
  });
}


/* validate Age */

if($('#age').length > 0)
{
  $('#age').validate();
  $('#userAges').rules("add",
  {
    required:true,
    messages:{required:"Please Enter Age"},
  });
}

/* validate package */

if($('#package').length > 0)
{
  $('#package').validate();
  $('#packageName').rules("add",
  {
    required:true,
    messages:{required:"Please Enter package Name"},
  });
  $('#cost').rules("add",
  {
    required:true,
    messages:{required:"Please select cost"},
  });
  $('#logo').rules("add",
  {
    required:true,
    messages:{required:"Please select logo for package"},
  });

}


/* validate category *///
//alert($('#categoryData').length);
if($('#categoryData').length > 0)
{
  $('#categoryData').validate( {rules: {
   
    'countryVal[]': {
        required: true
    },
},
messages: {
   
    'countryVal[]': {
        required: "Check at least 1 country"
    }
}});

  
  $('#category').rules("add",
  {
    required:true,
    messages:{required:"Please Enter Category Name"},
  })
  ,
  $('#description').rules("add",
  {
    required:true,
    messages:{required:"Please Enter description" },
  })
  ,
  $('#cost').rules("add",
  {
    required:true,
    messages:{required:"Please select cost" },
  }),
  $('#iconImage').rules("add",
  {
    required:true,
    messages:{required:"Please select Image to upload"},
  })
  ,
  $('#buttonImage').rules("add",
  {
    required:true,
    messages:{required:"Please select Image to upload"},
  })

}



/* validate sub category */

if($('#subCategoryData').length > 0)
{
  $('#subCategoryData').validate();
  $('#category').rules("add",
  {
    required:true,
    messages:{required:"Please select category"},
  });
  $('#subCategory').rules("add",
  {
    required:true,
    messages:{required:"Please Enter sub category"},
  });
}


if($('#exportData').length > 0)
{
  $('#exportData').validate();
  $('#category').rules("add",
  {
    required:true,
    messages:{required:"Please select category"},
  });
  $('#packages').rules("add",
  {
    required:true,
    messages:{required:"Please Enter Package"},
  });
  $('#region').rules("add",
  {
    required:true,
    messages:{required:"Please Enter region"},
  });
}


/* upload image File */

if($('#uploadImage').length > 0)
{
  $('#uploadImage').validate();
   $('#multipleImages').rules("add",
   {
     required:true,
     messages:{required:"Please select Image to upload"},
   });
}

/* Upload sound*/

if($('#uploadSound').length > 0)
{
  $('#uploadSound').validate();
   $('#multipleSound').rules("add",
   {
     required:true,
     messages:{required:"Please select sound to upload"},
   });
}

/* upload Video*/

if($('#uploadVedio').length > 0)
{
  $('#uploadVedio').validate();
   $('#multipleVideo').rules("add",
   {
     required:true,
     messages:{required:"Please select video to upload"},
   });
}

$('#createprofile').validate({
       rules: {
           "design_src[]": {
                         required: true,
                         extension: "jpg|jpeg|png",
                         filesize: 20971520,
                      }
							}
})


/* Question form Validation*/
if($('#questionValidateData').length > 0)
{
  $('#questionValidateData').validate({ // initialize the plugin
       rules: {
           'ageVal[]': {
               required: true
           },
           'countryVal[]': {
               required: true
           },
       },
       messages: {
           'ageVal[]': {
               required: "Check at least 1 age"
           },
           'countryVal[]': {
               required: "Check at least 1 country"
           }
       }
   });

  $('#category').rules("add",
  {
    required:true,
    messages:{required:"Please select category for question" },
  });

  $('#subCategory').rules("add",
  {
    required:true,
    messages:{required:"Please select sub category for question" },
  });

  $('#sltPackage').rules("add",
  {
    required:true,
    messages:{required:"Please select package for question" },
  });

  $('#timeAllowed').rules("add",
  {
    required:true,
    messages:{required:"Please enter Time Allowed for question" },
  });
  $('#questionText').rules("add",
  {
    required:true,
    messages:{required:"Please enter question" },
  });
  $('#option1').rules("add",
  {
    required:true,
    messages:{required:"Please enter option 1 for question" },
  });
  $('#option2').rules("add",
  {
    required:true,
    messages:{required:"Please enter option 2 for question"},
  });
  $('#option3').rules("add",
  {
    required:true,
    messages:{required:"Please enter option 3 for question"},
  });
  $('#option4').rules("add",
  {
    required:true,
    messages:{required:"Please enter option 4 for question" },
  });
  $('#answer').rules("add",
  {
    required:true,
    messages:{required:"Please select answer for question" },
  });


  $('#questionValidateData').validate();

}

/* ===============  export licence =============*/

function exportLicence(web)
{
    let webURL =  web;
    let country_id = $("#country_id").val();
    //alert(webURL);
    //alert(country_id);
    $.ajax({
      type: "GET",
      url: webURL+'exportlicence',
      data: 'country_id='+country_id,
      success: function(data)
      {

      }
    });
  }

/* =======================  Get Category ===================== */

function getCategory(web)
{
  //alert(web);
    let webURL =  web;
    if(window.location.href != webURL+'questions/0')
    {  
      
      let questionType =  $("#questionType").val();
      let category_id = $("#category").val();
      
      let package_id = $("#sltPackage").val();
      let questionActiveInactive =  $("#questionActiveInactive").val();
      let sub_category_id =  $("#hdnSubCategory").val();
      let age_id =  $("#age_id").val();
      let region =  $("#regionCountry").val();
      let fileType =   $("#radioClicked").val();;
      let activeSupport =   $("#activeSupport").val();;
      let activeAnswerOrder =   $("#activeAnswerOrder").val();;

      //alert("/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+activeSupport+'/'+activeAnswerOrder+'/0');
      
      let questionStateType =  $("#radioQuestionTypeClicked").val();
      let countryType = $("#countryTypeHidden").val();
   
      document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
    }
    else
    {
     
      let category_id = $("#category").val();
     
      $("#hdnCategory").val(category_id);
        $.ajax({
          type: "POST",
          url: webURL+'category/getSubTopics',
          data: 'category_id='+category_id,
          success: function(data)
          {
            console.log(data);
            $("#subCategory option").remove();
            $('#subCategory').append($('<option value="">Select SubCategory</option>'))
            $.each(JSON.parse(data), function(key,value)
            {
              $('#subCategory').append($('<option value="'+value.id+'" data-attr-id="'+category_id+'">'+value.subCategory+'</option>'))
            });
            
          }
        });
    }

  }


function getFreeplayCategory(web)
  {
  let webURL =  web;
  console.log("web url ", webURL);
  let category_id = $("#category").val();
  $("#hdnCategory").val(category_id);
    $.ajax({
      type: "POST",
      url: webURL+'category/getSubTopics',
      data: 'category_id='+category_id,
      success: function(data)
      {
        $("#subCategory option").remove();
        $('#subCategory').append($('<option>Select SubCategory</option>'))
        $.each(JSON.parse(data), function(key,value)
        {
          $('#subCategory').append($('<option value="'+value.id+'" data-attr-id="'+category_id+'">'+value.subCategory+'</option>'))
        });
        if(window.location.href != webURL+'questions')
        document.getElementById("search").href = "/viewFreeplayQuestions/"+category_id+'/0/0/0';
      }
    });
  }

/* ======================= Get SubCategory ===================== */

function getSubCategory(ele,web)
{
  let webURL =  web;
  let category_id = $(ele).find(':selected').attr('data-attr-id');
  let sub_category_id = $("#subCategory").val();
  $("#hdnSubCategory").val(sub_category_id);
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/0/0/0/0/0';
}

function getFreeplaySubCategory(ele,web)
{
  let webURL =  web;
  let category_id = $(ele).find(':selected').attr('data-attr-id');
  let sub_category_id = $("#subCategory").val();
  $("#hdnSubCategory").val(sub_category_id);
  document.getElementById("search").href = "/viewFreeplayQuestions/"+category_id+'/'+sub_category_id+'/0/0';
}


function setPackage(web)
{
  let webURL =  web;
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let region =  $("#regionCountry").val();
  let fileType =   $("#radioClicked").val();;
  //let fileType =  $("#fileTypeSearch").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/0';
}


function setAge(web)
{
  let webURL =  web;
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let region =  $("#regionCountry").val();
  let fileType =   $("#radioClicked").val();;
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  //let fileType =  $("#fileTypeSearch").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function setRegion(web)
{
  let region =  $("#regionCountry").val();
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let fileType =   $("#radioClicked").val();;
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  //let fileType =  $("#fileTypeSearch").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function setFileType(web)
{
  
  let fileType =  $("#inlineRadio1").val();
  $("#radioClicked").val(fileType);
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  //alert(fileType);
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  $("#activeSupport").val(0);
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();
  $("#supportUrlId").hide()
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function setFileType1(web)
{
  
  let fileType =  $("#inlineRadio2").val();
  $("#radioClicked").val(fileType);
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  $("#activeSupport").val(0);
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  $("#supportUrlId").hide()
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}

function setFileType2(web)
{
  let fileType =  $("#inlineRadio3").val();
  $("#radioClicked").val(fileType);
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  //alert(fileType);
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  $("#supportUrlId").show()
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function setFileType3(web)
{
  let fileType =  $("#inlineRadio4").val();
  $("#radioClicked").val(fileType);
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  //alert(fileType);
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  $("#activeSupport").val(0);
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  $("#supportUrlId").hide()
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function setQuestionType1(web)
{
  
  
  let questionStateType =  $("#inlineQuestionTypeRadio1").val();
  $("#radioQuestionTypeClicked").val(questionStateType);
  let fileType =   $("#radioClicked").val();;
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  //alert(fileType);
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType  +'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}



function setQuestionType2(web)
{
  let questionStateType =  $("#inlineQuestionTypeRadio2").val();
  $("#radioQuestionTypeClicked").val(questionStateType);
  let fileType =   $("#radioClicked").val();;
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  //alert(fileType);
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}

function oneCounrySelected(e,web)
{
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  
  let fileType =   $("#radioClicked").val();;
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  $("#questionActiveInactive").val();
  //alert(questionActiveInactive);
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();
  let countryType = $("#countryTypeHidden").val();
  if (e.checked) {
    countryType =   1
    $("#countryTypeHidden").val(1);
  } else {
    countryType =   0
    $("#countryTypeHidden").val(0);
  }
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType+'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function setActive(web)
{
  let fileType =   $("#radioClicked").val();
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  parseInt($("#questionActiveInactive").val());
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType  +'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}

function activeSupport1(web,type)
{
  
  let fileType =   $("#radioClicked").val();
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  parseInt($("#questionActiveInactive").val());
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  let activeSupport =   1
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  $("#activeSupport2").show()
  $("#activeSupport1").hide()
  $("#activeSupport").val(1)
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType  +'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}

function activeSupport2(e,web)
{
  $("#activeSupport1").show()
  let fileType =   $("#radioClicked").val();
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  parseInt($("#questionActiveInactive").val());
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  let activeSupport =   0
  let activeAnswerOrder =   $("#activeAnswerOrder").val();;
  if($('#activeSupport1:checked').val() == "on")
  {
    $("#activeSupport").val(1)
    activeSupport=1
  }
  else
  {
    $("#activeSupport").val(0) 
    activeSupport=0
  }
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType  +'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function activeAnswerOrder1(e,web)
{
 
  
  let fileType =   $("#radioClicked").val();
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  parseInt($("#questionActiveInactive").val());
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   1
  // $("#activeAnswerOrder1").hide()
  // $("#activeAnswerOrder2").show()+
  if($('#activeAnswerStatus:checked').val() == "on")
  {
    $("#activeAnswerOrder").val(1)
    activeAnswerOrder=1
  }
  else
  {
    $("#activeAnswerOrder").val(0) 
    activeAnswerOrder=0
  }
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType  +'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}

function activeAnswerOrder2(web,type)
{
  let fileType =   $("#radioClicked").val();
  let questionType =  $("#questionType").val();
  let questionActiveInactive =  parseInt($("#questionActiveInactive").val());
  let region =  $("#regionCountry").val();
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#category").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  let age_id =  $("#age_id").val();
  let questionStateType =  $("#radioQuestionTypeClicked").val();
  let activeSupport =   $("#activeSupport").val();;
  let activeAnswerOrder =   0
  $("#activeAnswerOrder1").show()
  $("#activeAnswerOrder2").hide()
  $("#activeAnswerOrder").val(0)
  let countryType = $("#countryTypeHidden").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/'+age_id+'/'+region+'/'+fileType+'/'+questionType+'/'+questionActiveInactive+'/'+questionStateType  +'/'+activeSupport+'/'+activeAnswerOrder+'/'+countryType+'/0';
}


function filterCategory(web)
{
  let webURL =  web;
  let category_id = $("#filterCate").val();

  if((category_id != '') )
  {
    window.location.href=webURL+'viewSubCategory/0/'+category_id+'/0'
  }
}


function filterCategory(web)
{
  let webURL =  web;
  let category_id = $("#filterCate").val();

  if((category_id != '') )
  {
    window.location.href=webURL+'viewSubCategory/0/'+category_id+'/0'
  }
}


function changeFileType(lang)
{
  //alert(lang)
  let fileType = $("#fileType_"+lang).val();
 // alert(fileType);
  if(fileType == 1)
  {
    //alert(2)
    $("#imageContainer_"+lang).show(250);
    $("#zoomEffect_"+lang).show(250);
    $("#soundContainer_"+lang).hide(250);
    $("#videoContainer_"+lang).hide(250);
    $("#supportVideoContainer_"+lang).hide(250);
    $("#videoCh_"+lang).hide(250);
  }
  else if(fileType == 2)
  {
    //alert(4)
    $("#imageContainer_"+lang).hide(250);
    $("#zoomEffect_"+lang).hide(250);
    $("#soundContainer_"+lang).show(250);
    $("#videoContainer_"+lang).hide(250);
    $("#supportVideoContainer_"+lang).hide(250);
    $("#videoCh_"+lang).hide(250);
  }
  else if(fileType == 3)
  {
    $("#imageContainer_"+lang).hide(250);
    $("#zoomEffect_"+lang).hide(250);
    $("#soundContainer_"+lang).hide(250);
    $("#videoContainer_"+lang).show(250);
    $("#supportVideoContainer_"+lang).show(250);
    $("#videoCh_"+lang).show(250);
  }
  else
  {
    
    $("#imageContainer_"+lang).hide(250);
    $("#zoomEffect_"+lang).hide(250);
    $("#soundContainer_"+lang).hide(250);
    $("#videoContainer_"+lang).hide(250);
    $("#supportVideoContainer_"+lang).hide(250);
    $("#videoCh_"+lang).hide(250);
  }
}

function changeFileTypeadd(lang)
{
  //alert(lang)
  let fileType = $("#fileType").val();
 // alert(fileType);
  if(fileType == 1)
  {
    //alert(2)
    $("#imageContainer").show(250);
    $("#zoomEffect").show(250);
    $("#soundContainer").hide(250);
    $("#videoContainer").hide(250);
    $("#supportVideoEffect").hide(250);
  }
  else if(fileType == 2)
  {
    //alert(4)
    $("#imageContainer").hide(250);
    $("#zoomEffect").hide(250);
    $("#soundContainer").show(250);
    $("#videoContainer").hide(250);
    $("#supportVideoEffect").hide(250);
  }
  else if(fileType == 3)
  {
    //alert(5)
    $("#imageContainer").hide(250);
    $("#zoomEffect").hide(250);
    $("#soundContainer").hide(250);
    $("#videoContainer").show(250);
    $("#supportVideoEffect").show(250);
  }
  else
  {
    
    $("#imageContainer").hide(250);
    $("#zoomEffect").hide(250);
    $("#soundContainer").hide(250);
    $("#videoContainer").hide(250);
    $("#supportVideoEffect").hide(250);
  }
}


function openSupportVideo(e)
{
  if(e.checked)
  {
    $("#supportV").show(250)
  }
  else
  {
    $("#supportV").hide(250)
  }
}




function changeFileType1(lang)
{
  k=0
  let language=lang.split(",")
  //console.log(language)
  for(let i=0;i<language.length;i++)
  {
    console.log("1",$("#imageUrl_"+language[i]).val())
    console.log("2",$("#soundUrl_"+language[i]).val())
    console.log("3",$("#videoUrl_"+language[i]).val())
    if($("#imageUrl_"+language[i]).val() != '' || $("#soundUrl_"+language[i]).val() != '' || $("#videoUrl_"+language[i]).val() != '' )
    {
      k++
    }
  }
  console.log("kkkk",k)
  console.log("kkkk",k)
  if(k == language.length)
  {
    $("#errorAll").show()
    //alert("all")
  }
  else
  {
    alert("none")
  }


  let fileType = $("#fileType").val();
  //alert(fileType);
  if(fileType == 1)
  {
    //alert(2)
    $("#imageContainer").show(250);
    $("#zoomEffect").show(250);
    $("#soundContainer").hide(250);
    $("#videoContainer").hide(250);
  }
  else if(fileType == 2)
  {
    //alert(4)
    $("#imageContainer").hide(250);
    $("#zoomEffect").hide(250);
    $("#soundContainer").show(250);
    $("#videoContainer").hide(250);
  }
  else if(fileType == 3)
  {
    //alert(5)
    $("#imageContainer").hide(250);
    $("#zoomEffect").hide(250);
    $("#soundContainer").hide(250);
    $("#videoContainer").show(250);
  }
  else
  {
    
    $("#imageContainer").hide(250);
    $("#zoomEffect").hide(250);
    $("#soundContainer").hide(250);
    $("#videoContainer").hide(250);
  }
}

/* delete pop up */

function deleteQF(web,id)
{
   document.getElementById("deleteQ").href=web+"deleteQuestion/"+id;
}
