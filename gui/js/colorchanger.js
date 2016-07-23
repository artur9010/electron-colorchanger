/**
 * Created by artur9010 on 19.07.2016.
 */

const waff = require("waff-query");
const messenger = require("facebook-chat-api");
const ColorPicker = require("simple-color-picker");

var colorpicker = new ColorPicker({
    color: '#FF0000',
    el: document.getElementById("colorpicker"),
    height: 250,
    width: 249,
    background: '#F5F5F4'
});

waff.qq(".color-block").forEach(function (el) {
    el.on("click", function(e){
        console.log(this.css("background-color"));
        console.log(this);
        colorpicker.setColor(this.css("background-color"));
    });
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function login_to_messenger() {
    messenger({
        email: getParameterByName("username"),
        password: getParameterByName("password")
    }, function callback(err, api) {
        if (err) {
            return console.error(err);
        }

        /*api.getUserInfo([100012621480066], function(err, ret) {
            if(err) return console.error(err);

            for(var prop in ret) {
                if(ret.hasOwnProperty(prop)) {
                    console.log(ret[prop])
                }
            }
        });*/

        api.getThreadList(0, 50, function (err, arr) {
            /*
            conversations:
            - image: imageSrc
            - name: name

            users:
            - image: thumbSrc
            - name: name
             */
            if(err){
                return console.error(err);
            }
            for(prot in arr){
                (function(){
                    //console.log(arr[prot]);
                    var conversationName;
                    var conversationImage;
                    var conversatonID;
                    if(arr[prot]["isCanonicalUser"]){ //is user
                        //console.log([arr[prot]["participantIDs"][0]].toString());
                        api.getUserInfo([arr[prot]["participantIDs"][0]], function(err, res){
                            if(err) return console.error(err);
                            for(var prop in res) {
                                conversationName = res[prop].name;
                                console.log(conversationName);
                                conversationImage = res[prop].thumbSrc;
                                conversatonID = prop;
                                addConversation(conversatonID, conversationName, conversationImage);
                            }
                        });
                    }else{ //is group
                        conversationName = arr[prot]["name"];
                        conversationImage = arr[prot]["imageSrc"];
                        conversatonID = arr[prot]["threadID"];
                        addConversation(conversatonID, conversationName, conversationImage);
                    }
                }());

            }
        });

        function addConversation(id, name, image){
            if(name !== ""){
                if(image == "" || typeof image == undefined){
                    image = "img/default.jpg"; //todo: not working?
                }
                var conversationDOM = waff.e("li.list-group-item.conversation#" + id);
                var conversationDOMimage = waff.e("img.img-circle.media-object.pull-left");
                conversationDOMimage.attr("width", 32);
                conversationDOMimage.attr("height", 32);
                conversationDOMimage.attr("src", image);
                var conversationDOMname = waff.e(".media-body");
                conversationDOMname.html("<strong>" + name + "</strong>");
                conversationDOM.append(conversationDOMimage);
                conversationDOM.append(conversationDOMname);
                conversationDOM.on("click", function(e){
                    waff.qq('.conversation.active').forEach((e)=>e.classList.remove('active'));
                    this.classList.add('active');
                })
                waff.q("#conversations").append(conversationDOM);
            }
        }

        waff.q("#change-button").on("click", function(e){
            changeColor();
        });

        function changeColor(){
            var id = waff.q(".conversation.active").id;
            //colorpicker.getColor()
            api.changeThreadColor(colorpicker.getHexString().toString(), id.toString(), function callback(err){
                if(err) return console.error(err);
            });
        }
    })
}