import { dom, library, config } from '@fortawesome/fontawesome-svg-core';
import {faPlusSquare} from '@fortawesome/free-solid-svg-icons/faPlusSquare';
import {faPen} from '@fortawesome/free-solid-svg-icons/faPen';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';
import {faAngleRight} from '@fortawesome/free-solid-svg-icons/faAngleRight';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';

config.autoReplaceSvg = 'nest';

library.add(faPlusSquare, faPen, faSearch, faAngleRight, faTimes);
dom.watch();

import $ from 'jquery';
window.jQuery = $;
window.$ = $;
global.$ = $;

import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/ds.css';

const Hogan = require("hogan.js");

import '@theidentityselector/thiss-jquery-plugin/src/ds-widget.js';

const search = Hogan.compile(require('!raw-loader!./templates/search.html'));
const saved = Hogan.compile(require('!raw-loader!./templates/saved.html'));
const pinned = Hogan.compile(require('!raw-loader!./templates/pinned.html'));
const too_many = Hogan.compile(require('!raw-loader!./templates/too_many.html'));
const no_results = Hogan.compile(require('!raw-loader!./templates/no_results.html'));

$(document).ready(function() {
    let timer = null;

    $("#search").on('hidden.bs.collapse',function(event) {
        $("#choose").toggleClass("d-none");
        $("#search").toggleClass("d-none");
        $("#searchinput").val('');
    }).on('shown.bs.collapse',function(event) {
        $("#choose").toggleClass("d-none");
        $("#search").toggleClass("d-none");
        $("#searchinput").focus();
    });

    $("#ds-search-list").on('show.bs', function(event) {
        timer = setTimeout( function () { $("#searching").show(); }, 500);
    }).on('hide.bs', function(event) {
        $("#searching").hide();
        if (timer) {
            clearTimeout(timer);
        }
    });

    $("#add_button").on('click',function(event) {
        event.preventDefault();
        $("#choose").toggleClass("d-none");
        $("#search").toggleClass("d-none");
    });

    $("#edit_button").on('click',function(event) {
        event.preventDefault();
        $("#choosetools").toggleClass("d-none");
        $("#done_button").toggleClass("d-none").toggleClass("display-block");
        $("#savedchoices").removeClass('choose').addClass('edit');

        $(".institution-text").addClass("item-fade");
        $(".institution-icon").addClass("item-fade");
        $(".institution-select").toggleClass("d-none");
        $(".institution-remove").toggleClass("d-none");
    });

    $("#done_button").on('click',function(event) {
        event.preventDefault();
        $("#done_button").toggleClass("d-none").toggleClass("display-block");
        $("#choosetools").toggleClass("d-none");
        $("#savedchoices").removeClass('edit').addClass('choose');
        $(".institution-text").removeClass("item-fade");
        $(".institution-icon").removeClass("item-fade");
        $(".institution-select").toggleClass("d-none");
        $(".institution-remove").toggleClass("d-none");
    });

    let ligo_object = {
        "auth": "saml",
        "descr": "Laser Interferometer Gravitational-Wave Observatory (LIGO)",
        "domain": "ligo.org",
        "entityID": "https://login.ligo.org/idp/shibboleth",
        "entity_icon_url": {
            "height": "60",
            "url": "https://login.ligo.org/SAML2/metadata/ui/ligologo80x60.png",
            "width": "80"
        },
        "entity_id": "https://login.ligo.org/idp/shibboleth",
        "hidden": "false",
        "name_tag": "LIGO",
        "scope": "ligo.org",
        "title": "LIGO",
        "type": "idp"
    };

    let kagra_object = {
        "auth": "saml",
        "descr": "KAGRA Large-scale Cryogenic Gravitational Wave Telescope Project",
        "domain": "shibbi.pki.itc.u-tokyo.ac.jp",
        "entityID": "https://shibbi.pki.itc.u-tokyo.ac.jp/idp/shibboleth",
        "entity_icon_url": {
            "height": "60",
            "url": "https://shibbi.pki.itc.u-tokyo.ac.jp/SAML2/metadata/ui/KAGRA-logo-60x80.png",
            "width": "80"
        },
        "entity_id": "https://shibbi.pki.itc.u-tokyo.ac.jp/idp/shibboleth",
        "hidden": "false",
        "name_tag": "SHIBBI",
        "scope": "shibbi.pki.itc.u-tokyo.ac.jp",
        "title": "KAGRA",
        "type": "idp"
    };

    $("#dsclient").discovery_client({
        context: process.env.DEFAULT_CONTEXT,
        mdq: process.env.MDQ_URL,
        persistence: process.env.PERSISTENCE_URL,
        search: process.env.SEARCH_URL,
        inputfieldselector: "#searchinput",
        render_search_result: function(item) {
            console.log("render_search_result");
            if (timer) {
                clearTimeout(timer); timer = null;
            }
            $("#searching").hide();
            return search.render(item);
        },
        render_saved_choice: function(item) {
            if (item.entity_id == ligo_object.entity_id || item.entity_id == kagra_object.entity_id) {
                return pinned.render(item);
            } else {
                return saved.render(item);
            }
        },
        too_many_results: function(count) {
            if (timer) {
                clearTimeout(timer); timer = null;
            }
            $("#searching").hide();
            return too_many.render({"count": count});
        },
        no_results: function() {
            if (timer) {
                clearTimeout(timer); timer = null;
            }
            $("#searching").hide();
            return no_results.render();
        },
        after: function(count,elt) {
            console.log("after - "+count);
            $("#searching").hide();

            let pinned_idps = [kagra_object, ligo_object];

            pinned_idps.forEach((p)=>{
                    let count = $('#ds-saved-choices').children("a[data-href='"+p['entity_id']+"']").length;
                    if (count == 0) {
                        $('#ds-saved-choices').prepend(pinned.render(p));
                    }
            });

            $("#choose").removeClass("d-none");
            $("#search").addClass("d-none");
        }
    }).discovery_client("sp").then(entity => $(".sp_title").text(entity.title))
});
