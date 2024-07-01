var gameModal = gameModal || {};


gameModal = function (game:any) {

    var _this = this;

    game.modals = {};

    /**
     * [hideModal description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    this.hideModal = function (type) {
        window.console.log(type);
        game.modals[type].visible = false;
    };

    return {

        createModal: function (options) {

            var type = options.type || ''; // must be unique
            var includeBackground = options.includeBackground; // maybe not optional
            var backgroundColor = options.backgroundColor || 0x000000;
            var backgroundOpacity = options.backgroundOpacity || 0.7;
            var modalCloseOnInput = options.modalCloseOnInput || false;
            var modalBackgroundCallback = options.modalBackgroundCallback || false;
            var vCenter = options.vCenter || true;
            var hCenter = options.hCenter || true;
            var itemsArr = options.itemsArr || [];
            var fixedToCamera = options.fixedToCamera || false;
            /*var vPadding = options.vPadding || 20;*/

            /////////////////////////////////////////////////////////////////////

            var modal;
            var modalGroup = game.add.group();
            if (fixedToCamera === true) {
                modalGroup.fixedToCamera = true;
                // modalGroup.cameraOffset.x = 0;
                // modalGroup.cameraOffset.y = 0;
            }

            if (includeBackground === true) {
                modal = game.add.graphics();
                modal.fillStyle(backgroundColor, backgroundOpacity);

                modal.fillRect(0, 0, game.game.config.width, game.game.config.height);

                if (modalCloseOnInput === true) {

                    var innerModal = game.add.sprite(0, 0);
                    innerModal.setInteractive()
                    // innerModal.inputEnabled = true;
                    innerModal.width = game.game.config.width;
                    innerModal.height = game.game.config.height;
                    innerModal.type = type;
                    innerModal.on('pointerdown',(e)=>{
                        console.log(e)
                        this.hideModal(e.type);
                    })
                    //innerModal.input.priorityID = 0;
                    // innerModal.events.onInputDown.add(function (e, pointer) {
                    //     this.hideModal(e.type);
                    // }, _this, 2);

                    modalGroup.add(innerModal);
                } else {

                    modalBackgroundCallback = true;
                    //modal.inputEnabled = true;
                    /*var innerModal = game.add.sprite(0, 0);
                    innerModal.inputEnabled = true;
                    innerModal.width = game.game.config.width;
                    innerModal.height = game.game.config.height;
                    innerModal.type = type;
                    innerModal.input.priorityID = 2;
                    innerModal.events.onInputDown.add(function(e){
                        //
                    }, _this);
                    modalGroup.add(innerModal);*/
                }
            }

            if (modalBackgroundCallback) {
                var innerModal = game.add.sprite(0, 0);
                innerModal.inputEnabled = true;
                innerModal.width = game.game.config.width;
                innerModal.height = game.game.config.height;
                innerModal.type = type;
               // innerModal.input.priorityID = 0;

                modalGroup.add(innerModal);
            }

            // add the bg
            if (includeBackground) {
                modalGroup.add(modal);
            }



            var modalLabel;
            for (var i = 0; i < itemsArr.length; i += 1) {
                var item = itemsArr[i];
                var itemType = item.type || 'text';
                var itemColor = item.color || 0x000000;
                var itemFontfamily = item.fontFamily || 'Arial';
                var itemFontSize = item.fontSize || 32;
                var itemStroke = item.stroke || '0x000000';
                var itemStrokeThickness = item.strokeThickness || 0;
                var itemAlign = item.align || 'center';
                var offsetX = item.offsetX || 0;
                var offsetY = item.offsetY || 0;
                var contentScale = item.contentScale || 1;
                var content = item.content || "";
                var centerX = game.game.config.width / 2;
                var centerY = game.game.config.height / 2;
                var callback = item.callback || false;
                var textAlign = item.textAlign || "left";
                var atlasParent = item.atlasParent || "";
                var buttonHover = item.buttonHover || content;
                var buttonActive = item.buttonActive || content;
                var graphicColor = item.graphicColor || 0xffffff;
                var graphicOpacity = item.graphicOpacity || 1;
                var graphicW = item.graphicWidth || 200;
                var graphicH = item.graphicHeight || 200;

                modalLabel = null;

                if (itemType === "text" || itemType === "bitmapText") {

                    if (itemType === "text") {
                        modalLabel = game.add.text(0, 0, content, {
                            font: itemFontSize + 'px ' + itemFontfamily,
                            fill: "#" + String(itemColor).replace("0x", ""),
                            stroke: "#" + String(itemStroke).replace("0x", ""),
                            strokeThickness: itemStrokeThickness,
                            align: itemAlign
                        });
                        modalLabel.contentType = 'text';
                        modalLabel.update();
                        modalLabel.x = ((game.game.config.width / 2) - (modalLabel.width / 2)) + offsetX;
                        modalLabel.y = ((game.game.config.height / 2) - (modalLabel.height / 2)) + offsetY;
                    } else {
                        modalLabel = game.add.bitmapText(0, 0, itemFontfamily, String(content), itemFontSize);
                        modalLabel.contentType = 'bitmapText';
                        modalLabel.align = textAlign;
                        modalLabel.updateText();
                        modalLabel.x = (centerX - (modalLabel.width / 2)) + offsetX;
                        modalLabel.y = (centerY - (modalLabel.height / 2)) + offsetY;
                    }

                } else if (itemType === "image") {
                    //content = item.imageKey || "";
                    modalLabel = game.add.image(0, 0, content);
                    modalLabel.scale.setTo(contentScale, contentScale);
                    modalLabel.contentType = 'image';
                    modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
                    modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
                }
                else if (itemType === "sprite") {
                    modalLabel = game.add.sprite(0, 0, atlasParent, content);
                    modalLabel.scale.setTo(contentScale, contentScale);
                    modalLabel.contentType = 'sprite';
                    modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
                    modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
                }
                else if (itemType === "button") {
                    modalLabel = game.add.button(0, 0, atlasParent, callback, this, buttonHover, content, buttonActive, content);
                    modalLabel.scale.setTo(contentScale, contentScale);
                    modalLabel.contentType = 'button';
                    modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
                    modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
                }
                else if (itemType === "graphics") {
                    modalLabel = game.add.graphics();
                    modalLabel.fillStyle(graphicColor, graphicOpacity);

                    modalLabel.fillRect(0, 0, graphicW, graphicH);
                    
                    modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
                    modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
                }

                modalLabel.offsetX = offsetX;
                modalLabel.offsetY = offsetY;


                if (callback !== false) {
                    modalLabel.inputEnabled = true;
                    modalLabel.pixelPerfectClick = true;
                    //modalLabel.priorityID = 10;
                    modalLabel.events.onInputDown.add(callback, modalLabel);
                }

                if (itemType !== "bitmapText" && itemType !== "graphics") {
                    //modalLabel.bringToTop();
                    modalGroup.add(modalLabel);
                    //modalLabel.bringToTop();
                    //modalGroup.bringToTop(modalLabel);
                } else {
                    modalGroup.add(modalLabel);
                    //modalGroup.bringToTop(modalLabel);
                }
            }

            modalGroup.visible = false;
            game.modals[type] = modalGroup;

        },
        updateModalValue: function (value, type, index, id) {
            var item;
            if (index !== undefined && index !== null) {
                item = game.modals[type].getChildAt(index);
            } else if (id !== undefined && id !== null) {

            }

            if (item.contentType === "text") {
                item.text = value;
                item.update();
                item.x = ((game.game.config.width / 2) - (item.width / 2)) + item.offsetX;
                item.y = ((game.game.config.height / 2) - (item.height / 2)) + item.offsetY;
            } else if (item.contentType === "bitmapText") {
                item.text = value;
                item.updateText();
                item.x = ((game.game.config.width / 2) - (item.width / 2)) + item.offsetX;
                item.y = ((game.game.config.height / 2) - (item.height / 2)) + item.offsetY;
            } else if (item.contentType === "image") {
                item.loadTexture(value);
            }

        },
        getModalItem: function (type, index) {
            return game.modals.getChildAt(index);
        },
        showModal: function (type) {
            
            console.log(type,game.modals[type])
            game.modals[type].visible = true;
            // you can add animation here
        },
        hideModal: function (type) {
            game.modals[type].visible = false;
            // you can add animation here
        },
        destroyModal: function (type) {
            game.modals[type].destroy();
            delete game.modals[type];
        }
    };
};


export default gameModal