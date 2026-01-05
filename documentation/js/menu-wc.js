'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">openweb-frontend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/TemplatePlaygroundModule.html" data-type="entity-link" >TemplatePlaygroundModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                            'id="xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <li class="link">
                                                <a href="components/TemplatePlaygroundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplatePlaygroundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                        'id="xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <li class="link">
                                            <a href="injectables/HbsRenderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HbsRenderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TemplateEditorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplateEditorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ZipExportService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZipExportService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/BusinessCardComponent.html" data-type="entity-link" >BusinessCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CallCenterComponent.html" data-type="entity-link" >CallCenterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CheckoutWizardComponent.html" data-type="entity-link" >CheckoutWizardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CobranzaWizardComponent.html" data-type="entity-link" >CobranzaWizardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmationModalComponent.html" data-type="entity-link" >ConfirmationModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ContactCard.html" data-type="entity-link" >ContactCard</a>
                            </li>
                            <li class="link">
                                <a href="components/ContactsComponent.html" data-type="entity-link" >ContactsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ContractSelectorComponent.html" data-type="entity-link" >ContractSelectorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DebtTableComponent.html" data-type="entity-link" >DebtTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorAlertComponent.html" data-type="entity-link" >ErrorAlertComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorModalComponent.html" data-type="entity-link" >ErrorModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomePageComponent.html" data-type="entity-link" >HomePageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingComponent.html" data-type="entity-link" >LoadingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainLayoutComponent.html" data-type="entity-link" >MainLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotFoundPageComponent.html" data-type="entity-link" >NotFoundPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProximamentePageComponent.html" data-type="entity-link" >ProximamentePageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QrDisplayComponent.html" data-type="entity-link" >QrDisplayComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchAssociateComponent.html" data-type="entity-link" >SearchAssociateComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StepCard.html" data-type="entity-link" >StepCard</a>
                            </li>
                            <li class="link">
                                <a href="components/WizardHeaderComponent.html" data-type="entity-link" >WizardHeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WizardNavComponent.html" data-type="entity-link" >WizardNavComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WizardProgressComponent.html" data-type="entity-link" >WizardProgressComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ApiService.html" data-type="entity-link" >ApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartService.html" data-type="entity-link" >CartService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConfirmationModalService.html" data-type="entity-link" >ConfirmationModalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErrorModalService.html" data-type="entity-link" >ErrorModalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FingerprintService.html" data-type="entity-link" >FingerprintService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HbsRenderService.html" data-type="entity-link" >HbsRenderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/QrService.html" data-type="entity-link" >QrService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TemplateEditorService.html" data-type="entity-link" >TemplateEditorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemeService.html" data-type="entity-link" >ThemeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ZipExportService.html" data-type="entity-link" >ZipExportService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ApiErrorResponse.html" data-type="entity-link" >ApiErrorResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Carrito.html" data-type="entity-link" >Carrito</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Categoria.html" data-type="entity-link" >Categoria</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompoDocConfig.html" data-type="entity-link" >CompoDocConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfirmationModalConfig.html" data-type="entity-link" >ConfirmationModalConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConsultarContratosRequest.html" data-type="entity-link" >ConsultarContratosRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConsultarDeudasRequest.html" data-type="entity-link" >ConsultarDeudasRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Contacto.html" data-type="entity-link" >Contacto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Contrato.html" data-type="entity-link" >Contrato</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ContratosResponse.html" data-type="entity-link" >ContratosResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosAsociado.html" data-type="entity-link" >DatosAsociado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosFacturacion.html" data-type="entity-link" >DatosFacturacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeudaSeleccionada.html" data-type="entity-link" >DeudaSeleccionada</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeudasResponse.html" data-type="entity-link" >DeudasResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorModalConfig.html" data-type="entity-link" >ErrorModalConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EstadoServicioResponse.html" data-type="entity-link" >EstadoServicioResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FingerprintCache.html" data-type="entity-link" >FingerprintCache</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FingerprintComponents.html" data-type="entity-link" >FingerprintComponents</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemCarrito.html" data-type="entity-link" >ItemCarrito</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NITResponse.html" data-type="entity-link" >NITResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PagoPendiente.html" data-type="entity-link" >PagoPendiente</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PagoRequest.html" data-type="entity-link" >PagoRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PagoResponse.html" data-type="entity-link" >PagoResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QRData.html" data-type="entity-link" >QRData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QRData-1.html" data-type="entity-link" >QRData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScreenInfo.html" data-type="entity-link" >ScreenInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Servicio.html" data-type="entity-link" >Servicio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ServicioConfig.html" data-type="entity-link" >ServicioConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ServicioConfigResponse.html" data-type="entity-link" >ServicioConfigResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ServiciosResponse.html" data-type="entity-link" >ServiciosResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});