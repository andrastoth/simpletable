/*!
 * simplaTable v1.0.0 jQuery plugin
 * http://atandrastoth.co.uk/webdesign/
 * Author : Tóth András
 * Copyright 2013 Tóth András
 * Released under the MIT license
 * Date: 27 Jan 13 2013
 */
(function($) {
  $.fn.extend({
    simpleTable: function(options, callback) {
      var table = $(this).attr("id");
      var defaults = {
        name: '',
        width: 800,
        height: 500,
        buttons: false,
        editable: false,
        filterbox: false,
        database: false,
        remove: false,
        original: false
      };
      var options = $.extend(defaults, options);
      return this.each(function() {
        var oparam;
        var selectedRow;
        var o = options;
        var obj = $(this);
        var colgroup = "<colgroup>";
        var simpleTableCellWidth = [];
        if(o.remove && obj.parent().attr("class") == "tableScroller") {
          obj.parent().parent().parent().remove();
          return;
        } else {
          if(o.original && obj.parent().attr("class") == "tableScroller") {
            original();
            return;
          } else {
            if($(this).attr("class") == "simpleTable") {
              return;
            }
          }
        }
        obj.removeAttr("style");
        obj.removeClass();
        obj.addClass("simpleTable");
        $.each(obj.children("thead").children("tr:first").children("th"), function(index) {
          simpleTableCellWidth.push($(this).outerWidth() + 12);
          colgroup = colgroup + '<col style = "width:' + simpleTableCellWidth[index] + 'px !important;">';
        });
        colgroup = colgroup + "</colgroup>";
        obj.prepend(colgroup);
        simpleTableWidth = obj.width();
        simpleTableWidth = simpleTableWidth + simpleTableCellWidth.length * 12;
        obj.wrapAll('<div class = "tableHolder">');
        heads = obj.children("thead").clone();
        obj.children("thead").css("display", "none");
        heads.wrapAll('<table class = "simpleTable">');
        heads = heads.parent();
        heads.prepend(colgroup);
        obj.wrapAll('<div class = "tableScroller">');
        heads.wrapAll('<div class = "tableHeader">');
        tableHeader = heads.parent();
        obj.parent("div").parent("div").prepend(tableHeader);
        obj.width(simpleTableWidth);
        obj.parent().prev().children("table").width(simpleTableWidth);
        obj.parent().prev().andSelf().wrapAll('<div class = "outerTableDiv">');
        evenOdd();
        rows = obj.children("tbody").children("tr");
        cells = rows.children("td");
        outerTableDiv = obj.parent().prev();
        tableScroller = obj.parent();
        outerTableDiv = obj.parent().parent();
        tableHolder = obj.parent().parent().parent();
        if(o.width == "100%") {
          o.width = $(this).parent().width() - 50;
        } else {
          if(o.width == "auto") {
            tableHolder.width(obj.width() + 20);
          } else {
            tableHolder.width(o.width + 50);
          }
        }
        tableScroller.css("height", o.height - 70);
        tableScroller.prev().css("width", obj.width() + 50);
        obj.css("table-layout", "fixed");
        tableHeader.children().css("table-layout", "fixed");
        hstr = "<div class='tableHolderFilter'>";
        if(o.buttons) {
          hstr = hstr + "<button id = 'addrow'>Add row</button><button id = 'dellrow'>Dell row</button>";
        } else {
          hstr = hstr + "<button id = 'addrow' disabled>Add row</button><button id = 'dellrow' disabled>Dell row</button>";
        }
        hstr = hstr + "<a>" + o.name + "</a>";
        if(o.filterbox) {
          hstr = hstr + "<input text ='Filter rows:'id = 'filter'type = 'text'>";
          outerTableDiv.append("<a></a>");
          outerTableDiv.append("<a></a>");
          rowCount();
        } else {
          hstr = hstr + "<input text ='Filter rows:'id = 'filter'type = 'text' disabled>";
        }
        hstr = hstr + "</div>";
        if(o.buttons || o.name != '' || o.filterbox) {
          outerTableDiv.prepend(hstr);
        }
        tableScroller.scroll(function(e) {
          tableScroller.prev().css("left", 0 - tableScroller.scrollLeft());
        });
        if(o.editable) {
          obj.on("dblclick", "td", function() {
            if($("#tdinput").length > 0) {
              return;
            }
            tdwidth = $(this).width() - 6;
            values = $(this).html();
            chars = $(this).html().length;
            oparam = {
              "oldvalue": values
            };
            if(chars == 0) {
              chars = 5;
            }
            $(this).html('<input type="text" id="tdinput" value="' + values + '" style ="width:' + tdwidth + 'px;">');
            $(this).children("input").focus();
          });
        }
        obj.on("click", "tr", function() {
          selectedRow = $(this);
          obj.find("tr").removeClass("selectedtr");
          $(this).addClass("selectedtr");
        });
        obj.on("focusout", "td input", function() {
          param = [];
          id = $(this).parent("td").parent("tr").children("td:first").attr("data");
          idval = $(this).parent("td").parent("tr").children("td:first").text();
          values = $(this).val();
          col = $(this).parent("td").attr("data");
          param = {
            "id": id,
            "idval": idval,
            "col": col,
            "value": values
          };
          param = $.extend(oparam, param);
          $(this).parent("td").html(values);
          if(o.database == true && o.name != "") {
            ret = com(o.name, "update", param);
          }
        });
        outerTableDiv.on("click", "#dellrow", function() {
          if(o.database == true && o.name != "") {
            id = selectedRow.children("td:first").attr("data");
            idval = selectedRow.children("td:first").html();
            param = {
              "id": id,
              "idval": idval
            };
            ret = com(o.name, "dellrow", param);
          }
          selectedRow.remove();
          obj.find("tbody tr").removeClass();
          evenOdd();
          rowCount();
        });
        outerTableDiv.on("click", "#addrow", function() {
          if(o.database == true && o.name != "") {
            id = rows.children("td:first").attr("data");
            ret = com(o.name, "addrow", {
              "id": id
            });
          }
          appendTr = obj.find("tbody tr:first").clone();
          obj.append(appendTr);
          obj.find("tbody tr:last td").html("&nbsp;");
          obj.find("tbody tr").removeClass();
          evenOdd();
          rowCount();
          tableScroller.scrollTop(obj.height());
        });
        outerTableDiv.on("keyup", "#filter", function(e) {
          if(outerTableDiv.find("#filter").val() != "") {
            searcher(outerTableDiv.find("#filter").val());
          } else {
            obj.find("tbody  tr").removeClass("filtered");
          }
          rowCount();
        });

        function rowCount() {
          if(outerTableDiv.children("a").length == 0) {
            return;
          }
          myrows = obj.find("tr").length - 1;
          myfilterd = 0;
          $.each(rows, function(index) {
            if($(this).attr("class").indexOf("filtered") !== -1) {
              myfilterd = myfilterd + 1;
            }
          });
          myfilterd = myrows - myfilterd;
          outerTableDiv.children("a")[0].innerHTML = "Total rows : " + myrows;
          outerTableDiv.children("a")[1].innerHTML = "Filtered rows : " + myfilterd;
        }
        function original() {
          tableHolder.find('a').remove();
          obj.off();
          obj.unwrap();
          obj.unwrap();
          obj.unwrap();
          obj.prev().remove();
          obj.prev().remove();
          obj.children("thead").removeAttr("style");
          obj.children("colgroup").remove();
          obj.removeClass();
          obj.removeAttr("style");
          obj.children().children().removeClass();
        }
        function evenOdd() {
          obj.find("tbody tr").removeClass("even", "odd");
          obj.find("tbody tr:even").addClass("evenRow");
          obj.find("tbody tr:odd").addClass("oddRow");
        }
        function searcher(data) {
          obj.find("tbody tr").addClass("filtered");
          obj.find("tbody td").filter(function() {
            return $(this).text().toLowerCase().indexOf(data) != -1;
          }).closest("tr").removeClass("filtered");
        }
        function com(table, order, param) {
          var returnvalue;
          $.ajax({
            url: "simpletable.php",
            type: "POST",
            dataType: "json",
            data: {
              async: false,
              tablename: table,
              order: order,
              param: param
            },
            complete: function(data, xhr, textStatus) {},
            success: function(data, textStatus, xhr) {
              er = "";
              if(data.SQLERROR) {
                $.each(data.SQLERROR, function(index) {
                  er = er + "\n" + data.SQLERROR[index];
                });
                $.each(selectedRow.children("td"), function(index) {
                  if($(this).attr("data") == param.id) {
                    $(this).html(param.oldvalue);
                  }
                });
                alert(er + "\n" + data.code + "\n" + data.query);
                return;
              }
              returnvalue = JSON.parse(data[param.id]);
              if(order == "addrow") {
                obj.find("tbody tr:last td:first").html(returnvalue);
              }
            },
            error: function(xhr, textStatus, errorThrown) {
              if($.parseJSON(xhr.error)) {
                alert($.parseJSON(xhr.error));
              }
            }
          });
          return returnvalue;
        }
        if(typeof callback == "function") {
          callback.call(this);
        }
      });
    }
  });
})(jQuery);
