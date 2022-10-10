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
  //
  // if($('#userLogin').length > 0)
  // {
  //     $('#userLogin').validate();
  //     $('#username').rules("add",{
  //         required:true,
  //         messages:{required:"Enter Username"}
  //     });
  //
  //     $('#password').rules("add",{
  //         required:true,
  //         messages:{required:"Enter Password"}
  //         });
  // }

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


  if($('#organizationForm').length > 0)
  {
      $('#organizationForm').validate();
      $('#organization').rules("add",{
          required:true,
          messages:{required:"Enter Organization Name"}
      });
  }



  if($('#giftCard').length > 0)
  {
      $('#giftCard').validate();
      $('#giftName').rules("add",{
          required:true,
          messages:{required:"Enter Gift Name"}
      });
      $('#giftCost').rules("add",{
          required:true,
          messages:{required:"Enter Gift Cost"}
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
  $('#generatedLicence').rules("add",
  {
    required:true,
    messages:{required:"Please click Generate Button"},
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
    messages:{required:"Please Enter cost"},
  });
  $('#logo').rules("add",
  {
    required:true,
    messages:{required:"Please select logo for package"},
  });

}


/* validate category */

if($('#categoryData').length > 0)
{
  $('#categoryData').validate();
  $('#category').rules("add",
  {
    required:true,
    messages:{required:"Please Enter Category Name"},
  });
}

/* Question form Validation*/
if($('#questionValidateData').length > 0)
{
  $('#questionValidateData').validate();

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
    messages:{required:"Please Enter QUESTION" },
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
    messages:{required:"Please enter answer for question" },
  });

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
  let webURL =  web;
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
        document.getElementById("search").href = "/viewQuestions/"+category_id+'/0/0/0';
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
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/0/0';
}

function setPackage(web)
{
  let webURL =  web;
  let package_id = $("#sltPackage").val();
  let category_id = $("#hdnCategory").val();
  let sub_category_id =  $("#hdnSubCategory").val();
  document.getElementById("search").href = "/viewQuestions/"+category_id+'/'+sub_category_id+'/'+package_id+'/0';
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


function changeFileType()
{
  let fileType = $("#fileType").val();
  if(fileType == 1)
  {
    $("#imageContainer").show(250);
    $("#zoomEffect").show(250);
    $("#soundContainer").hide(250);
    $("#videoContainer").hide(250);
  }
  else if(fileType == 2)
  {
    $("#imageContainer").hide(250);
    $("#zoomEffect").hide(250);
    $("#soundContainer").show(250);
    $("#videoContainer").hide(250);
  }
  else if(fileType == 3)
  {
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
