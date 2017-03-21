Notify311.view.Notify311Component = function Notify311Component(vnode) {

    var images = [],
        controller = {
            vnodeRefs: {},
            componentScope: {
                showCityStateZip: false
            }
        }

    let getLocation$ = Rx.Observable.create((theObserver) => {
        navigator.geolocation.getCurrentPosition((position) => {
                console.log('Call Google Maps Javascript API Services', position);
                let _position = position;
                let coder = new google.maps.Geocoder();
                let latlng = new google.maps.LatLng(_position.coords.latitude, _position.coords.longitude);
                coder.geocode({'latLng': latlng}, (latlang) => {
                    theObserver.next(latlang)
                    theObserver.complete()
                });
            }, (it) => {
                theObserver.error(it)
            }
        )
    }).map((it) => it[0])
        .pluck('address_components')
        .flatMap((it) => Rx.Observable.from(it))
        .reduce((data, it) => {
            data[it.types[0]] = it
            return data
        }, {})
    //.subscribe({next: (it) => console.log(it), error: (err) => console.log(err)})

    return {

        oninit: function (vnode) {
            _.assign(controller.vnodeRefs, {rootVnode: vnode})
        },

        _oncreate: (vnode) => {

            $(vnode.dom).form({
                    fields: {
                        firstName: {
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please enter a first name'
                                }
                            ]
                        },
                        lastName: {
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please enter a last name'
                                }
                            ]
                        }
                    },
                    inline: true,
                    onSuccess: function (e) {
                        e.preventDefault();
                    }
                }
            )
        },

        view: function (vnode) {

            return m('.ui.container.topcontainer', [

                m('form.ui.tiny.form', {style: {width: '100%', margin: '1rem 0rem'}}, [
                    m('.ui.basic.segment.notify311-segment', [
                        m('h4.ui top attached header', [
                            'Location',
                            m('a.ui label', {
                                    style: {float: 'right'},
                                    onclick: (e) => {
                                        Notify311.view.LoadingMask.show()
                                        getLocation$.subscribe({
                                            next: (it) => {
                                                console.log(it)
                                                $('form').form('set values', {
                                                    address1: it.street_number.long_name + ' ' + it.route.short_name,
                                                    city: it.locality.long_name,
                                                    state: it.administrative_area_level_1.long_name,
                                                    postalCode: it.postal_code.long_name
                                                })
                                            },
                                            error: (err) => {
                                                Notify311.view.LoadingMask.hide()
                                                Notify311.view.Modal.warn(err.message || 'Error obtaining current location')
                                            },
                                            complete: Notify311.view.LoadingMask.hide()
                                        })
                                    }
                                }, [
                                    m('i.ui icon compass'),
                                    'GPS'
                                ]
                            )
                        ]),

                        m('.ui attached segment', [
                            m('input[hidden][name=id] ui'),
                            m('.field', [
                                m('label', 'Address'),
                                m('.ui.two.fields', [
                                    m('.ui twelve wide field', [
                                        m('input[text][name=address1][placeholder=Street Address] ui')
                                    ]),
                                    m('.ui four wide field', [
                                        m('input[type=text][name=address2][placeholder=(Optional) Apt #] ui')
                                    ])
                                ]),

                                m(Notify311.view.Notify311CityStateZip, {controller: controller})

                            ])
                        ])
                    ]),

                    m(Notify311.view.Notify311Description),
                    m(Notify311.view.Notify311Photos, {images: images}),

                    m('.ui.basic.segment.notify311-segment', [
                        m('.ui primary submit button', {
                            onclick: (e) => {
                                e.preventDefault()

                                let message,
                                    formData = new FormData(document.querySelector('form')),
                                    dataObject = Array.from(formData.keys()).reduce((data, key) => {
                                        console.log(data, key)
                                        data[key] = formData.get(key)
                                        return data
                                    }, {})

                                console.log('dataObject', dataObject)
                                if (!dataObject.address1) message = 'Please provide a location'
                                if (!dataObject.description) message = 'Please provide a description'
                                if (!dataObject.address1 && !dataObject.description) message = 'Please provide a location and description'

                                if (message) {
                                    Notify311.view.Modal.error(message, '', '')
                                    return
                                }

                                images.forEach((file, i) => {
                                    console.log(file)
                                    formData.delete('photos')
                                    formData.append('images', file.file)
                                })

                                Rx.Observable.ajax({
                                        method: "POST",
                                        url: '/notify311',
                                        body: formData,
                                        progressSubscriber: (new Rx.Subject()).subscribe({
                                            next: (it) => {
                                                console.log('progressSubscriber', it)
                                            },
                                            error: (err) => console.log('progressSbscriber error', err),
                                            complete: () => console.log('progressSubscriber compete')
                                        })
                                    }
                                ).subscribe({
                                    next: (it) => console.log('next', it),
                                    error: (err) => console.log('error', err),
                                    complete: () => console.log('compete')
                                })
                            }
                        }, 'Save')
                    ])
                ])

            ])


        }

    }
}

Notify311.view.Notify311Photos = function Notify311Photos(vnode) {

    let images = null

    return {
        oninit: (vnode) => {
            images = vnode.attrs.images
        },

        view: (vnode) => {

            return m('.ui.basic.segment.notify311-segment', [

                m('h4.ui top attached header', ['Photos', m('a.ui label', {
                    style: {float: 'right'},
                    onclick: function (e) {
                        console.log('click', e)
                        $('input:file', $(e.target).parents()).click();
                    }
                }, [m('i.ui large icon camera', {style: {marginRight: 0}})])]),

                m('input[type=file][name=photos][multiple][style="display:none"]', {
                    oncreate: (vnode) => {

                    },

                    onchange: function (e) {
                        if (!e.target.files.length) console.warn('Zero length files')

                        _.forEach(e.target.files, (file) => {
                            let reader = new FileReader()

                            reader.addEventListener("load", function () {
                                console.log(file, reader)
                                images.push({file: file, reader: reader});
                                m.redraw();
                            }, false);

                            reader.readAsDataURL(file);

                        })

                    }
                }),

                images && m('.ui attached segment', {style: {borderTopStyle: 'none'}},
                    m('.ui grid',
                        images.map(
                            (it, i) => {
                                return m('.crop', [
                                    m('a.ui.top.right.attached.label', {
                                        onclick: (e) => {
                                            e.preventDefault()
                                            console.log(i, e, it)
                                            images.splice(i, 1)
                                        },
                                        style: {
                                            borderRadius: 0,
                                            padding: '0.5em',
                                            zIndex: 1000
                                        }
                                    }, m('i.ui icon delete', {style: {marginLeft: 0}})),
                                    m('img.ui.image[style=margin-top:0px !important]', {
                                        style: {_marginTop: '0'},
                                        src: it.reader.result
                                    })

                                ])
                            }
                        )
                    )
                )

            ])

        }

    }

}

Notify311.view.Notify311Description = function Notify311Description(vnode) {

    return {

        view: (vnode) => {
            console.log('Notify311.view.Notify311Description', vnode)
            return m('.ui.basic.segment.notify311-segment', [
                m('h4.ui top attached header', 'Description'),
                m('.ui attached segment', [
                    m('.field', [
                        m('textarea[name=description][placeholder=Provide details on issue] .ui notify311-description', {
                            oninput: (e) => {
                                console.log('oninput', e)
                                $(e.target).outerHeight('2em').outerHeight(e.target.scrollHeight);
                            }
                        })
                    ])
                ])
            ])
        }

    }
}

Notify311.view.Notify311CityStateZip = function Notify311CityStateZip(vnode) {

    let topLabel = (controller) => {
        return !(_.get(controller, 'componentScope.showCityStateZip'))
            ? m('label', ['City / State / Zip', m('i.ui icon expand', {
                onclick: (e) => {
                    let current = _.get(controller, 'componentScope.showCityStateZip')
                    showCityStateZip = _.set(controller, 'componentScope.showCityStateZip', !current)
                },
                style: {float: 'right'}
            })])
            : m('label', m('i.ui icon compress', {
                onclick: (e) => {
                    $(e.target.parentElement).transition('fadeIn')
                    let current = _.get(controller, 'componentScope.showCityStateZip')
                    showCityStateZip = _.set(controller, 'componentScope.showCityStateZip', !current)
                },
                style: {float: 'right'}
            }))
    }

    let counter = 0
    return {

        view: (vnode) => {

            let controller = vnode.attrs.controller,
                showCityStateZip = _.get(controller, 'componentScope.showCityStateZip'),
                cityStateZipVnode = _.get(controller.vnodeRefs, 'cityStateZipVnode'),
                cszStyle = {transition: 'height .5s', overflow: 'hidden'};

            showCityStateZip && cityStateZipVnode ? _.assign(cszStyle, {
                    height: $(cityStateZipVnode.dom).height() + 'px'
                })
                : _.assign(cszStyle, {
                    height: '0px'
                })


            return [
                topLabel(controller),
                m('div', {
                    style: cszStyle,
                    ontransitionend: (e) => {
                        if (!showCityStateZip) {

                        }
                        console.log('ontransitionend', e, vnode)
                    },
                }, [
                    m('.ui.three.fields' + '.' + counter, {
                        controller: controller,
                        oninit: (vnode) => {
                            _.set(vnode.attrs.controller.vnodeRefs, 'cityStateZipVnode', vnode)
                        },
                    }, [
                        m('.ui eight wide field', [
                            m('label', 'City'),
                            m('input[type=text][name=city][placeholder=City] ui')
                        ]),
                        m('.ui four wide field', [
                            m('label', 'State'),
                            m('input[type=text][name=state][placeholder=State] ui')
                        ]),
                        m('.ui four wide field', [
                            m('label', 'Zip'),
                            m('input[type=text][name=postalCode][placeholder=Zip code] ui')
                        ])
                    ])
                ])
            ]

        }

    }
}
