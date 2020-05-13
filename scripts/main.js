$(function () {
    const setPopup=function (openButtonSelector,closeButtonSelector,changeClassName,elementToSetHeightSelector) {
        let openButton=$(openButtonSelector);
        let bodyElement=$('body');

        openButton.on('click',function () {
            if (bodyElement.hasClass(changeClassName) == false) {
                bodyElement.addClass(changeClassName);

                if (elementToSetHeightSelector!=null) {
                    let mainStartPosition = $(elementToSetHeightSelector).parent().position().top;
                    $(elementToSetHeightSelector).css('max-height', ($(window).height() - mainStartPosition) + 'px');
                }

                $(closeButtonSelector).on('click',function (evt) {
                    if (bodyElement.hasClass(changeClassName) == true && evt.target==this) {
                        bodyElement.removeClass(changeClassName);

                        if (elementToSetHeightSelector!=null) {
                           $(elementToSetHeightSelector).css('max-height', '');
                        }

                        $(closeButtonSelector).off('click');
                        if (openButtonSelector==closeButtonSelector) { setPopup(openButtonSelector,closeButtonSelector,changeClassName,elementToSetHeightSelector); }
                    }
                });
            }
        });
    }

    const setMenuEvents=function(menuSelector, menuButtonSelector,changeClassName,elementToSetHightSelector)
    {
        setPopup(menuButtonSelector,menuButtonSelector,changeClassName,elementToSetHightSelector);

        $(menuSelector+'>* a').on('click',function () {
            $(menuButtonSelector).click();
        });

        $('a[href^="#"]').on('click',function(evt){
            let elm = $(this).attr('href');
            $('html').animate({
                scrollTop: $(elm).offset().top
            },300);
            evt.preventDefault();
        });
    }
    const setSlider=function(sliderSelector) {
        let is_animated=false;
        let rootSliderContainer=sliderSelector;
        let mainSliderContainer=sliderSelector+' .image-slider-items';
        let sliderVisualRoundListSelector=sliderSelector+' .image-slider-visual-round-list';

        const StartSliderAnimate=function(elementCount){
            const activateAnimation=function (direction,margin) {
                let startAnimationElement=$(mainSliderContainer+' >*:first-child');

                if (direction=='right') {
                    startAnimationElement.css('margin-left',-margin+'px');
                }

                startAnimationElement.animate(
                    {
                        marginLeft: direction=='left' ? -margin+"px" : 0
                    },
                    300,
                    function () {
                        $(mainSliderContainer+' >*[slider-forDelete]').remove();
                        startAnimationElement.removeAttr('slider-startAnimation');
                        is_animated = false;
                        SliderVisualRoundList_SetCurrentElement();
                    }
                );
                is_animated = true;
            }

            let list_item=$(mainSliderContainer+' > *');

            if (list_item.length>1 && !is_animated && elementCount!=null && elementCount!=undefined && elementCount!=0) {
                if (list_item.length-1==elementCount) {elementCount=-1};
                let direction = elementCount > 0 ? 'right' : 'left';
                elementCount=Math.abs(elementCount);

                /* Собираем временный массив изображений для перемещения и вычисляем сдвиг для анимации */

                let marginSumm = 0;

                let eqx=direction=='left' ? '-n+'+elementCount : 'n+'+(list_item.length-elementCount+1);
                let workElementsList=$(mainSliderContainer+' > *:nth-child('+eqx+')');
                let workElementsList_Clone=workElementsList.clone();
                workElementsList.each(function (index,elm) {
                    $(elm).attr('slider-forDelete','true');
                    marginSumm=marginSumm+$(elm).outerWidth(true);
                })

                /*Добавляем элементы в основной поток в зависимости от направления сдвига*/
                if (direction == 'left') {
                    workElementsList_Clone.insertAfter(list_item.last());
                } else {
                    workElementsList_Clone.insertBefore(list_item.first());
                }

                /*Запускаем анимацию перемещения*/
                activateAnimation (direction, marginSumm);
            }
        };
        const Slider_GetCurrentElementIndex=function () {
            return parseInt($(mainSliderContainer+' >*:not([slider-forDelete])').first().attr('slider-id'));
        }
        const SliderVisualRoundList_SetCurrentElement=function() {
            let current_ItemId=Slider_GetCurrentElementIndex();

            $(sliderVisualRoundListSelector+' .image-slider-visual-round__item-button.current_slider').removeClass('current_slider');
            $(sliderVisualRoundListSelector+' >*').eq(parseInt(current_ItemId)).find('.image-slider-visual-round__item-button').addClass('current_slider');
        }
        const CreateSliderVisualRoundList=function() {
            $(mainSliderContainer+' > *').each(function (index,elm) {
                let newRoundItem=
                    $('<li class="image-slider-visual-round__item">' +
                                '<button class="image-slider-visual-round__item-button" aria-label="image-item"></button>' +
                           '</li>');

                newRoundItem.find('.image-slider-visual-round__item-button').on('click',function (clicked_elm) {
                    let count=Slider_GetCurrentElementIndex()-parseInt($(elm).attr('slider-id'));
                    StartSliderAnimate(count);
                });
                newRoundItem.appendTo(sliderVisualRoundListSelector);
            });
            SliderVisualRoundList_SetCurrentElement();
        }
        const SetSliderEvents=function () {
            let isMouseDown=false;
            let startDragCursorPosition=0;

            const getCurrentCursorPosition=function(cursor,isTouchAction) {
                return !isTouchAction ? cursor.pageX : cursor.originalEvent.touches[0].clientX;
            }
            const onPressed=function(cursor,isTouchAction){
                isMouseDown=true;
                startDragCursorPosition=getCurrentCursorPosition(cursor,isTouchAction);
            }
            const onUnPressed=function(){
                isMouseDown=false;
            }
            const onMove=function(cursor,isTouchAction){
                if (isMouseDown) {
                    let isCurrentPosition=getCurrentCursorPosition(cursor,isTouchAction);
                    let del=isTouchAction ? 75 : 200;
                    let direction=
                        (startDragCursorPosition-isCurrentPosition)/ del > 1 ? -1 :
                            (startDragCursorPosition-isCurrentPosition)/del < -1 ? 1 : null;

                    StartSliderAnimate(direction);
                }
            }

            $(rootSliderContainer+' >.image-slider__left-button').on('click', function () {
                StartSliderAnimate(-1);
            });
            $(rootSliderContainer+' >.image-slider__right-button').on('click', function () {
                StartSliderAnimate(1);
            });

            $(rootSliderContainer).
                on('dragstart',function () { return false; }).
                on('touchstart',function (cursor) { onPressed(cursor,true); }).
                on('mousedown',function (cursor) { onPressed(cursor,false); }).
                on('mouseup',function () { onUnPressed(); }).
                on('mouseleave',function () {onUnPressed(); }).
                on('touchend',function () {onUnPressed(); }).
                on('touchcancel',function () {onUnPressed(); }).
                on('mousemove',function (cursor) {onMove(cursor,false);}).
                on('touchmove',function (cursor) {onMove(cursor,true);});
        }
        const PrependSliderItems=function(sliderSelector) {
            $(mainSliderContainer +'> *').each(function (index,elm) {
                $(elm).attr('slider-id',index);
            }) ;
        }

        PrependSliderItems();
        CreateSliderVisualRoundList();
        SetSliderEvents();
    }
    const setServiceWorker=function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.min.js')
                .then(
                    () => navigator.serviceWorker.ready.then((worker) =>
                    {
                        worker.sync.register('syncdata');
                    })
                )
                .catch((err) => console.log('Error Text: '+err));
        }
    }
    const setFeedBackButtonsEvents=function(buttonSelectorData,feedbackContainer,elementToSetHeightSelector) {
        $(buttonSelectorData).each(function (index,feedbackButton) {
            setPopup(feedbackButton[0],'.feedback-container, .feedback-container-close__button','feedback-container__self_open',elementToSetHeightSelector);
            $(feedbackButton[0]).on('click',function () {

                $('.feedback-form-input__name-input, .feedback-form-input__email-input, .feedback-form-input__phone-input').each(function (input_index,input_elem) {
                    $(input_elem).val('');
                });

                $('.feedback-container .feedback-form__header-text').html(feedbackButton[2]);
                if (feedbackButton[1]==true) {
                    $(feedbackContainer).addClass('feedback-container__self_with-email');
                } else
                {
                    $(feedbackContainer).removeClass('feedback-container__self_with-email');
                }
            });
        });
    }
    const setFeedBackInputTextLimits=function(feedBackNameInputSelector,feedBackEmailInputSelector,feedBackPhoneInputSelector,feedbackSubmitButtonSelector) {
        const feedBackNameValidatePattern='([a-zA-Zа-яА-Я\\s]{4,50})';
        const feedBackPhoneValidatePattern='^[+]\\d{0,15}$';
        const feedBackPhoneFullValidatePattern='^[+]\\d{6,15}$';
        const feedBackEmailValidatePattern='(^[a-zA-Z]).*[@](.{1,})[.][a-zA-Z]{2,}';

        $(feedBackNameInputSelector).on('keypress',function (evtdata) {
            if (!evtdata.key.match('[a-zA-Zа-яА-Я\\s]')) {evtdata.preventDefault();}
        });

        $(feedBackPhoneInputSelector).on('keypress',function (evtdata) {
            let txt=$(feedBackPhoneInputSelector)[0].value+evtdata.key;
            if (!txt.match(feedBackPhoneValidatePattern)) {evtdata.preventDefault();}
        });

        $(feedBackNameInputSelector).attr('pattern',feedBackNameValidatePattern);
        $(feedBackPhoneInputSelector).attr('pattern',feedBackPhoneFullValidatePattern);
        $(feedBackEmailInputSelector).attr('pattern',feedBackEmailValidatePattern);

        $(feedbackSubmitButtonSelector).on('submit',function () {

        });
    };

    setServiceWorker();
    setSlider('.my-portfolio-container .image-slider-container');
    setMenuEvents(
        '.header-container .navigation-items-list',
        '.header-container .navigation-menu',
        'header__navigation-menu_open',
        '.header__navigation-menu_open .header-container .navigation-items-list');
    setFeedBackButtonsEvents([
        ['.me-container__about-me-ext-button',true,'Получить консультацию'],
        ['.phone-number-call-back-button',false,'Заказ обратного звонка'],
        ['.what-i-do__how-cost-button',false,'Запрос цены'],
        ['.my-portfolio__order-project-button',false,'Заказ проекта']
    ],'.feedback-container',null);
    setFeedBackInputTextLimits(
        '.feedback-form-input__name-input',
        '.feedback-form-input__email-input',
        '.feedback-form-input__phone-input',
        '.feedback-form__submit-button');
});