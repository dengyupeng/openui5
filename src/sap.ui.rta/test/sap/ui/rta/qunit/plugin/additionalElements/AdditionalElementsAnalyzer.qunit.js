/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/model/json/JSONModel",
	"sap/m/ColumnListItem",
	"sap/ui/rta/util/BindingsExtractor",
	"sap/ui/dt/ElementUtil",
	"sap/base/Log",
	"./TestUtils"
],
function(
	AdditionalElementsAnalyzer,
	JSONModel,
	ColumnListItem,
	BindingsExtractor,
	ElementUtil,
	Log,
	TestUtils
) {
	"use strict";

	QUnit.module("Given a test view", TestUtils.commonHooks(),
	function () {
		QUnit.test("checks if navigation and absolute binding work", function(assert) {
			var oGroupElement1 = this.oView.byId("EntityType02.NavigationProperty"); // With correct navigation binding
			var oGroupElement2 = this.oView.byId("EntityType02.IncorrectNavigationProperty"); // With incorrect navigation binding
			var oGroupElement3 = this.oView.byId("EntityType02.AbsoluteBinding"); // Absolute binding
			sap.ui.getCore().applyChanges();

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element : oGroupElement1,
						action : {} //nothing relevant for the analyzer tests
					}, {
						element : oGroupElement2,
						action : {} //nothing relevant for the analyzer tests
					}, {
						element : oGroupElement3,
						action : {} //nothing relevant for the analyzer tests
					}]
				},
				addODataProperty : {
					action : {} //not relevant for test
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroupElement1.getParent(), oActionsObject).then(function(aAdditionalElements) {
				// We expect only one element to be returned with a correct navigation property
				assert.equal(aAdditionalElements.length, 2, "then there are 1 additional Elements available");
				assert.equal(aAdditionalElements[0].label, oGroupElement1.getLabelText(), "the element with correct navigation binding should be in the list");
				assert.equal(aAdditionalElements[0].tooltip, oGroupElement1.getLabelText(), "the label is used as tooltip for elements with navigation binding");
				assert.equal(aAdditionalElements[1].label, oGroupElement3.getLabelText(), "the element with absolute binding should be in the list");
				assert.equal(aAdditionalElements[1].tooltip, oGroupElement3.getLabelText(), "the label is used as tooltip for elements with absolute binding");
			});
		});

		QUnit.test("checks if navigation and absolute binding work with delegate", function(assert) {
			var oGroupElement1 = this.oView.byId("DelegateEntityType02.NavigationProperty"); // With correct navigation binding
			var oGroupElement2 = this.oView.byId("DelegateEntityType02.IncorrectNavigationProperty"); // With incorrect navigation binding
			var oGroupElement3 = this.oView.byId("DelegateEntityType02.AbsoluteBinding"); // Absolute binding
			sap.ui.getCore().applyChanges();

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element : oGroupElement1,
						action : {} //nothing relevant for the analyzer tests
					}, {
						element : oGroupElement2,
						action : {} //nothing relevant for the analyzer tests
					}, {
						element : oGroupElement3,
						action : {} //nothing relevant for the analyzer tests
					}]
				},
				addODataProperty : {
					action: {}, //not relevant for test
					delegateInfo: {
						payload: {},
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroupElement1.getParent(), oActionsObject).then(function(aAdditionalElements) {
				// We expect only one element to be returned with a correct navigation property
				assert.equal(aAdditionalElements.length, 2, "then there are 1 additional Elements available");
				assert.equal(aAdditionalElements[0].label, oGroupElement1.getLabel(), "the element with correct navigation binding should be in the list");
				assert.equal(aAdditionalElements[0].tooltip, oGroupElement1.getLabel(), "the label is used as tooltip for elements with navigation binding");
				assert.equal(aAdditionalElements[1].label, oGroupElement3.getLabel(), "the element with absolute binding should be in the list");
				assert.equal(aAdditionalElements[1].tooltip, oGroupElement3.getLabel(), "the label is used as tooltip for elements with absolute binding");
			});
		});

		QUnit.test("when asking for the invisible sections of an object page layout", function(assert) {
			var oObjectPageLayout = this.oView.byId("ObjectPageLayout");

			var oActionsObject = {
				aggregation: "sections",
				reveal : {
					elements : [
						{
							element : this.oView.byId("idMain1--ObjectPageSectionInvisible"),
							action : {} //not relevant for test
						}, {
							element : this.oView.byId("idMain1--ObjectPageSectionStashed1"),
							action : {} //not relevant for test
						},
						{
							element : this.oView.byId("idMain1--ObjectPageSectionStashed2"),
							action : {} //not relevant for test
						}
					]
				}
			};
			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oObjectPageLayout, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 3, "then 3 additional sections are available");
				TestUtils.assertElementsEqual(aAdditionalElements[0], {
					selected : false,
					label : "Invisible ObjectPage Section",
					tooltip : "Invisible ObjectPage Section",
					type : "invisible",
					elementId : "idMain1--ObjectPageSectionInvisible",
					bindingPaths: undefined
				}, "the invisible section is found", assert);
				TestUtils.assertElementsEqual(aAdditionalElements[1], {
					selected : false,
					label : "idMain1--ObjectPageSectionStashed1",
					tooltip : "idMain1--ObjectPageSectionStashed1",
					type : "invisible",
					elementId : "idMain1--ObjectPageSectionStashed1",
					bindingPaths: undefined
				}, "the 1. stashed section is found", assert);
				TestUtils.assertElementsEqual(aAdditionalElements[2], {
					selected : false,
					label : "idMain1--ObjectPageSectionStashed2",
					tooltip : "idMain1--ObjectPageSectionStashed2",
					type : "invisible",
					elementId : "idMain1--ObjectPageSectionStashed2",
					bindingPaths: undefined
				}, "the 2. stashed section is found", assert);
			});
		});

		QUnit.test("when getting unbound elements for EntityType01 Group,", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel
				},
				relevantContainer: this.mAddODataPropertyAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 3, "then 3 additional properties are available");
				assert.deepEqual(aAdditionalElements[0], {
					selected : false,
					label : "Entity1-Property06-Unbound",
					tooltip : "Unbound Property6",
					type : "odata",
					entityType : "EntityType01",
					name : "Property06",
					bindingPath : "Property06",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the unbound property is found");
				assert.deepEqual(aAdditionalElements[1], {
					selected : false,
					label : "Entity1-Property07-ignored-unbound", //available, because there is no ignore filtering implemented
					tooltip : "Unbound Property7",
					type : "odata",
					entityType : "EntityType01",
					name : "Property07",
					bindingPath : "Property07",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the 2nd unbound property is found");
				assert.deepEqual(aAdditionalElements[2], {
					selected : false,
					label : "Property08",
					tooltip : "Property without sap:label",
					type : "odata",
					entityType : "EntityType01",
					name : "Property08",
					bindingPath : "Property08",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the 3rd unbound property without sap:label is returned with technical name as label");
			});
		});

		QUnit.test("when getting unrepresented elements from delegate for EntityType01 Group,", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType01");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel
				},
				delegateInfo: {
					payload: {},
					delegate: this.oDelegate
				},
				relevantContainer: this.mAddODataPropertyAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 3, "then 3 additional properties are available");
				assert.deepEqual(aAdditionalElements[0], {
					selected : false,
					label : "Entity1-Property06-Unbound",
					tooltip : "Unbound Property6",
					type : "delegate",
					entityType : "EntityType01",
					name : "Property06",
					bindingPath : "Property06",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the unbound property is found");
				assert.deepEqual(aAdditionalElements[1], {
					selected : false,
					label : "Entity1-Property07-ignored-unbound", //available, because there is no ignore filtering implemented
					tooltip : "Unbound Property7",
					type : "delegate",
					entityType : "EntityType01",
					name : "Property07",
					bindingPath : "Property07",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the 2nd unbound property is found");
				assert.deepEqual(aAdditionalElements[2], {
					selected : false,
					label : "Property08",
					tooltip : "Property without sap:label",
					type : "delegate",
					entityType : "EntityType01",
					name : "Property08",
					bindingPath : "Property08",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the 3rd unbound property without sap:label is returned with technical name as label");
			});
		});
		QUnit.test("when getting unbound elements for EntityType01 Group with a filter function,", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var oSmartForm = this.oView.byId("MainForm");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel,
					filter: this.mAddODataPropertyAction.filter
				},
				relevantContainer: oSmartForm
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 2, "then 2 additional properties are available");
				assert.deepEqual(aAdditionalElements[0], {
					selected : false,
					label : "Entity1-Property06-Unbound",
					tooltip : "Unbound Property6",
					type : "odata",
					entityType : "EntityType01",
					name : "Property06",
					bindingPath : "Property06",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the unbound property is found");
			});
		});

		QUnit.test("when getting unbound elements for EntityType01 Group without a relevant container,", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel
				}
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 3, "then all properties of EntityType01 are available, because the GroupElements are not bound to any of them");
				assert.deepEqual(aAdditionalElements[0], {
					selected : false,
					label : "Entity1-Property06-Unbound",
					tooltip : "Unbound Property6",
					type : "odata",
					entityType : "EntityType01",
					name : "Property06",
					bindingPath : "Property06",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the unbound property is found");
				assert.deepEqual(aAdditionalElements[1], {
					selected : false,
					label : "Entity1-Property07-ignored-unbound",
					tooltip : "Unbound Property7",
					type : "odata",
					entityType : "EntityType01",
					name : "Property07",
					bindingPath : "Property07",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the 2nd unbound property is found");
			});
		});
		QUnit.test("when getting unrepresented elements from delegate for EntityType01 Group without a relevant container,", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType01");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel
				},
				delegateInfo: {
					payload: {},
					delegate: this.oDelegate
				}
			};

			return AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 3, "then all properties of EntityType01 are available, because the GroupElements are not bound to any of them");
				assert.deepEqual(aAdditionalElements[0], {
					selected : false,
					label : "Entity1-Property06-Unbound",
					tooltip : "Unbound Property6",
					type : "delegate",
					entityType : "EntityType01",
					name : "Property06",
					bindingPath : "Property06",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the unbound property is found");
				assert.deepEqual(aAdditionalElements[1], {
					selected : false,
					label : "Entity1-Property07-ignored-unbound",
					tooltip : "Unbound Property7",
					type : "delegate",
					entityType : "EntityType01",
					name : "Property07",
					bindingPath : "Property07",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the 2nd unbound property is found");
			});
		});
		QUnit.test("when getting unbound elements for EntityType02 with complex properties and field control properties", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType02");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel
				},
				relevantContainer: this.mAddODataPropertyAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 10, "then 10 additional properties are available");
				assert.deepEqual(aAdditionalElements[0], {
					selected : false,
					label : "Entity2-Property01-Label",
					tooltip : "Entity2-Property01-QuickInfo",
					type : "odata",
					entityType : "EntityType02",
					name : "EntityType02_Property01",
					bindingPath : "EntityType02_Property01",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the unbound normal property is found");
				assert.deepEqual(aAdditionalElements[1], {
					selected : false,
					label : "ComplexProperty 03",
					tooltip : "ComplexProperty 03-QuickInfo",
					type : "odata",
					entityType : "EntityType02",
					name : "ComplexProperty03",
					bindingPath : "EntityType02_Complex/ComplexProperty03",
					originalLabel: "",
					duplicateComplexName: true,
					referencedComplexPropertyName: "EntityType02_Complex"
				}, "the unbound complex property is found");
				assert.deepEqual(aAdditionalElements[2], {
					selected : false,
					label : "ComplexProperty 01",
					tooltip : "ComplexProperty 01-QuickInfo",
					type : "odata",
					entityType : "EntityType02",
					name : "ComplexProperty01",
					bindingPath : "EntityType02_SameComplexType/ComplexProperty01",
					originalLabel: "",
					duplicateComplexName: true,
					referencedComplexPropertyName: "Same Complex Type Property with label"
				}, "the unbound complex property with a custom name is found");
				assert.equal(aAdditionalElements[3].bindingPath, "EntityType02_SameComplexType/ComplexProperty02");
				assert.equal(aAdditionalElements[4].bindingPath, "EntityType02_SameComplexType/ComplexProperty03");
				assert.equal(aAdditionalElements[5].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty01");
				assert.equal(aAdditionalElements[6].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty02");
				assert.equal(aAdditionalElements[7].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty03");
				assert.deepEqual(aAdditionalElements[8], {
					selected : false,
					label : "ComplexProperty 05",
					tooltip : "ComplexProperty 05-QuickInfo",
					type : "odata",
					entityType : "EntityType02",
					name : "ComplexProperty05",
					bindingPath : "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty05",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: "EntityType02_OtherComplexTypeSameComplexProperties"
				}, "the unbound complex property with a custom name is found");
				assert.equal(aAdditionalElements[9].bindingPath, "EntityType02_Property07_with_implicit_nav");
			});
		});
		QUnit.test("when getting unrepresented elements from delegate for EntityType02 with complex properties and field control properties", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType02");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel
				},
				delegateInfo: {
					payload: {},
					delegate: this.oDelegate
				},
				relevantContainer: this.mAddODataPropertyAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 10, "then 10 additional properties are available");
				assert.deepEqual(aAdditionalElements[0], {
					selected : false,
					label : "Entity2-Property01-Label",
					tooltip : "Entity2-Property01-QuickInfo",
					type : "delegate",
					entityType : "EntityType02",
					name : "EntityType02_Property01",
					bindingPath : "EntityType02_Property01",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: ""
				}, "the unbound normal property is found");
				assert.deepEqual(aAdditionalElements[1], {
					selected : false,
					label : "ComplexProperty 03",
					tooltip : "ComplexProperty 03-QuickInfo",
					type : "delegate",
					entityType : "EntityType02",
					name : "ComplexProperty03",
					bindingPath : "EntityType02_Complex/ComplexProperty03",
					originalLabel: "",
					duplicateComplexName: true,
					referencedComplexPropertyName: "EntityType02_Complex"
				}, "the unbound complex property is found");
				assert.deepEqual(aAdditionalElements[2], {
					selected : false,
					label : "ComplexProperty 01",
					tooltip : "ComplexProperty 01-QuickInfo",
					type : "delegate",
					entityType : "EntityType02",
					name : "ComplexProperty01",
					bindingPath : "EntityType02_SameComplexType/ComplexProperty01",
					originalLabel: "",
					duplicateComplexName: true,
					referencedComplexPropertyName: "Same Complex Type Property with label"
				}, "the unbound complex property with a custom name is found");
				assert.equal(aAdditionalElements[3].bindingPath, "EntityType02_SameComplexType/ComplexProperty02");
				assert.equal(aAdditionalElements[4].bindingPath, "EntityType02_SameComplexType/ComplexProperty03");
				assert.equal(aAdditionalElements[5].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty01");
				assert.equal(aAdditionalElements[6].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty02");
				assert.equal(aAdditionalElements[7].bindingPath, "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty03");
				assert.deepEqual(aAdditionalElements[8], {
					selected : false,
					label : "ComplexProperty 05",
					tooltip : "ComplexProperty 05-QuickInfo",
					type : "delegate",
					entityType : "EntityType02",
					name : "ComplexProperty05",
					bindingPath : "EntityType02_OtherComplexTypeSameComplexProperties/ComplexProperty05",
					originalLabel: "",
					duplicateComplexName: false,
					referencedComplexPropertyName: "EntityType02_OtherComplexTypeSameComplexProperties"
				}, "the unbound complex property with a custom name is found");
				assert.equal(aAdditionalElements[9].bindingPath, "EntityType02_Property07_with_implicit_nav");
			});
		});
		QUnit.test("when getting unbound elements for EntityTypeNav (which doesn't contain navigation properties)", function(assert) {
			var oGroup = this.oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[0];
			var mActionObject = {
				action: {
					aggregation: "formContainers",
					getLabel: this.mAddODataPropertyAction.getLabel
				},
				relevantContainer: this.mAddODataPropertyAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.length > 0, "then the properties are found");
			});
		});

		QUnit.test("when checking group elements to find original label in add dialog, after renaming custom label and removing group elements", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement1 = this.oView.byId("ComplexBindingCase");
			oGroupElement1.setLabel("Renamed Label");
			oGroupElement1.setVisible(false);
			var oGroupElement2 = this.oView.byId("EntityType02.CompProp1");
			oGroupElement2.setVisible(false);
			sap.ui.getCore().applyChanges();

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //nothing relevant for the analyzer test
					}, {
						element: oGroupElement2,
						action : {} //nothing relevant for the analyzer test
					}]
				},
				addODataProperty : {
					action : {} //not relevant for test
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 2, "then the 2 invisible elements with oData are returned");
				assert.equal(aAdditionalElements[0].label, "Renamed Label", "element with custom label renamed");
				assert.equal(aAdditionalElements[0].originalLabel, "EntityType02_Property03", "element contains original label from oData and not custom label");
				assert.equal(aAdditionalElements[0].type, "invisible", "element made invisible");
				assert.equal(aAdditionalElements[0].tooltip, "Entity2-EntityType02_Property03-QuickInfo (from annotation)", "quickinfo annotation is used as tooltip also for hidden elements, if available");
				assert.equal(aAdditionalElements[1].originalLabel, "", "element contains original label blank as it was not renamed");
				assert.equal(aAdditionalElements[1].type, "invisible", "element made invisible");
				assert.equal(aAdditionalElements[1].tooltip, "ComplexProperty 01-QuickInfo", "sap:quickinfo is used as tooltip");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing a removed field with absolute binding pointing to another entity", function(assert) {
			var oGroup = this.oView.byId("OtherGroup");
			var oGroupElement1 = this.oView.byId("NavForm.EntityType01.Prop1");
			oGroupElement1.setVisible(false);
			sap.ui.getCore().applyChanges();

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}]
				},
				addODataProperty : {
					action : {} //not relevant for test
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing an invisible field with bindings inside belonging to the same context", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var oGroupElement1 = this.oView.byId("EntityType01.Prop9");
			var oGroupElement2 = this.oView.byId("EntityType01.Prop10"); //deleted custom field

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}, {
						element: oGroupElement2,
						action : {} //not relevant for test
					}]
				},
				addODataProperty : {
					action : {} //not relevant for test
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement2)), "then the field2 is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group with delegate containing an invisible field with bindings inside belonging to the same context", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType01");
			var oGroupElement1 = this.oView.byId("DelegateEntityType01.Prop9");
			var oGroupElement2 = this.oView.byId("DelegateEntityType01.Prop10"); //deleted custom field

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}, {
						element: oGroupElement2,
						action : {} //not relevant for test
					}]
				},
				addViaDelegate : {
					action : {}, //not relevant for test,
					delegateInfo: {
						payload: {},
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement2)), "then the field2 is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing a removed field with other binding context without addODataProperty action", function(assert) {
			var oGroup = this.oView.byId("OtherGroup");
			var oGroupElement1 = this.oView.byId("NavForm.EntityType01.Prop1");
			oGroupElement1.setVisible(false);
			sap.ui.getCore().applyChanges();

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}]
				}
			};

			this.sandbox.stub(oGroup, "getBindingContext").returns({ getPath: function() { return "/fake/binding/path/group"; }});
			this.sandbox.stub(oGroupElement1, "getBindingContext").returns({ getPath: function() { return "/fake/binding/path/groupElement1"; }});
			this.sandbox.stub(BindingsExtractor, "getBindings").returns(["fakeBinding"]);

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.ok(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the field is available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group containing a field with the same property name as the one of an invisible field in a different entity", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var oGroupElement1 = this.oView.byId("EntityType02.CommonProperty");

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}]
				},
				addODataProperty : {
					action : {} //not relevant for test
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the other field is not available on the dialog");
			});
		});

		QUnit.test("when getting invisible elements of a bound group with delegate containing a field with the same property name as the one of an invisible field in a different entity", function(assert) {
			var oGroup = this.oView.byId("DelegateGroupEntityType01");
			var oGroupElement1 = this.oView.byId("DelegateEntityType02.CommonProperty");

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}]
				},
				addViaDelegate : {
					action : {}, //not relevant for test,
					delegateInfo: {
						payload: {},
						delegate: this.oDelegate
					}
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.notOk(aAdditionalElements.some(TestUtils.isFieldPresent.bind(null, oGroupElement1)), "then the other field is not available on the dialog");
			});
		});

		QUnit.test("when renaming a smart element", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType02");
			var oGroupElement1 = oGroup.getGroupElements()[3];
			oGroupElement1.setVisible(false);
			oGroupElement1.setLabel("RenamedLabel");
			//ComplexType binding element
			var oGroupElement2 = oGroup.getGroupElements()[0];
			oGroupElement2.setVisible(false);
			oGroupElement2.getLabelControl().setText("RenamedLabel");
			sap.ui.getCore().applyChanges();

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}, {
						element: oGroupElement2,
						action : {} //not relevant for test
					}]
				},
				addODataProperty : {
					action : {} //not relevant for test
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 2, "then there are 2 additional Elements available");
				assert.equal(aAdditionalElements[0].label, "RenamedLabel", "the unbound normal property is found");
				assert.equal(aAdditionalElements[1].label, "RenamedLabel", "the unbound complex property is found");
			});
		});

		QUnit.test("when asking for the invisible fields of a simpleForm", function(assert) {
			var oSimpleForm = this.oView.byId("SimpleForm");
			var aFormElements = oSimpleForm.getAggregation("form").getFormContainers().reduce(function(aAllFormElements, oFormContainer) {
				return aAllFormElements.concat(oFormContainer.getFormElements());
			}, []).filter(function(oFormElement) {
				return oFormElement.isVisible() === false;
			}).map(function(oFormElement) {
				return {
					element : oFormElement,
					action : {} //not relevant for test
				};
			});

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : aFormElements
				},
				addODataProperty : {
					action : {} //not relevant for test
				}
			};

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oSimpleForm, oActionsObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 4, "then the 3 invisible elements with oData + the element without binding are returned");
				assert.equal(aAdditionalElements[0].label, "Invisible 1", "then the label is set correctly");
				assert.equal(aAdditionalElements[1].label, "Complex Invisible oData Property", "then the label is set correctly");
				assert.ok(typeof aAdditionalElements[2].label === 'string', "the element without binding is assigned a label");
				assert.equal(aAdditionalElements[3].label, "Invisible Property04", "then the label is set correctly");
				assert.equal(aAdditionalElements[0].type, "invisible", "then the type is set correctly");
				assert.equal(aAdditionalElements[1].type, "invisible", "then the type is set correctly");
				assert.equal(aAdditionalElements[2].type, "invisible", "then the type is set correctly");
				assert.equal(aAdditionalElements[3].type, "invisible", "then the type is set correctly");
			});
		});

		QUnit.test("when getting unbound elements for EntityType01 Group with a function to filter ignored SmartForm Fields", function(assert) {
			var oGroup = this.oView.byId("GroupEntityType01");
			var oSmartForm = this.oView.byId("MainForm");
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel,
					filter: this.mAddODataPropertyAction.filter
				},
				relevantContainer: oSmartForm
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 2, "then the ignored property is not part of the additional elements");
			});
		});

		QUnit.test("when getting unbound elements with an element without model", function(assert) {
			var oGroup = new sap.ui.comp.smartform.Group();
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel,
					filter: this.mAddODataPropertyAction.filter
				},
				relevantContainer: this.mAddODataPropertyAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 0, "then there are no ODataProperties");
			});
		});

		QUnit.test("when getting unbound elements with an element with a json model", function(assert) {
			var oGroup = new sap.ui.comp.smartform.Group();
			oGroup.setModel(new JSONModel({elements: "foo"}));
			var mActionObject = {
				action: {
					aggregation: "formElements",
					getLabel: this.mAddODataPropertyAction.getLabel,
					filter: this.mAddODataPropertyAction.filter
				},
				relevantContainer: this.mAddODataPropertyAction.relevantContainer
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oGroup, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 0, "then there are no ODataProperties");
			});
		});

		QUnit.test("when asking for the unbound elements of a simpleForm", function(assert) {
			var oSimpleForm = this.oView.byId("SimpleForm");

			var mActionObject = {
				action : {
					aggregation: "form",
					oRelevantContainer: this.mAddODataPropertyAction.relevantContainer
				}
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oSimpleForm, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 5, "then 5 unbound elements are available");
			});
		});

		QUnit.test("when checking group elements to find original label in add dialog, after renaming a custom add label and removing that group elements", function(assert) {
			var oGroupElement1 = this.oView.byId("EntityType02.Prop2Button");
			var sGroupElement1OriginalLabel = ElementUtil.getLabelForElement(oGroupElement1);
			var sRenamedLabel = "Renamed Label";
			oGroupElement1.setVisible(false);

			var oGroupElement2 = this.oView.byId("EntityType02.CompProp1");
			var sGroupElement2OriginalLabel = ElementUtil.getLabelForElement(oGroupElement2);
			oGroupElement2.setVisible(false);

			var oActionsObject = {
				aggregation: "formElements",
				reveal : {
					elements : [{
						element: oGroupElement1,
						action : {} //not relevant for test
					}, {
						element: oGroupElement2,
						action : {} //not relevant for test
					}]
				},
				addViaCustom : {
					action : {}, //not relevant for test
					items: [{
						label: sGroupElement1OriginalLabel,
						tooltip: "Tooltip1",
						id: "customItem1"
					}, {
						label: sGroupElement2OriginalLabel,
						tooltip: "Tooltip2",
						id: "customItem2"
					}]
				}
			};
			var oGroup = this.oView.byId("GroupEntityType01");
			this.sandbox.stub(oGroupElement1, "getId").returns(oGroup.getParent().getId() + "-" + oActionsObject.addViaCustom.items[0].id);
			this.sandbox.stub(oGroupElement2, "getId").returns(oGroup.getParent().getId() + "-" + oActionsObject.addViaCustom.items[1].id);

			oGroupElement1.setLabel(sRenamedLabel);

			return AdditionalElementsAnalyzer.enhanceInvisibleElements(oGroup, oActionsObject).then(function(aAdditionalElements) {
				assert.strictEqual(oGroupElement1.label, aAdditionalElements[0].label, "then first invisible element has label property set");
				assert.strictEqual(oGroupElement1.renamedLabel, true, "then first invisible element has the renamedLabel property set");
				assert.strictEqual(oGroupElement1.tooltip, oActionsObject.addViaCustom.items[0].tooltip, "then first invisible element has the correct tooltip property");

				assert.strictEqual(oGroupElement2.label, aAdditionalElements[1].label, "then second invisible element has label property set");
				assert.notOk(oGroupElement2.renamedlabel, "then second invisible element has no renamedLabel property");
				assert.strictEqual(oGroupElement2.tooltip, oActionsObject.addViaCustom.items[1].tooltip, "then second invisible element has the correct tooltip property");

				assert.equal(aAdditionalElements.length, 2, "then the 2 invisible elements with oData are returned");

				assert.equal(aAdditionalElements[0].label, sRenamedLabel, "then the first invisible item has the renamed label");
				assert.equal(aAdditionalElements[0].originalLabel, sGroupElement1OriginalLabel, "then the first invisible item has the original label");
				assert.equal(aAdditionalElements[0].type, "invisible", "then the first invisible item is if of type invisible");
				assert.equal(aAdditionalElements[0].tooltip, oActionsObject.addViaCustom.items[0].tooltip, "then the first invisible item has the correct tooltip");

				assert.equal(aAdditionalElements[1].label, sGroupElement2OriginalLabel, "then the second invisible item has the correct label");
				assert.equal(aAdditionalElements[1].type, "invisible", "then the second invisible item if of type invisible");
				assert.equal(aAdditionalElements[1].tooltip, oActionsObject.addViaCustom.items[1].tooltip, "then the second invisible item has the correct tooltip");
			});
		});

		QUnit.test("when getCustomAddItems is called for an element and custom add action", function(assert) {
			var mAction = {
				items: [{
					label: "CustomItem1",
					id: "customId1" // element exists
				}, {
					label: "CustomItem2",
					id: "customId2" // element doesn't exist
				}, {
					label: "CustomItem3" // no id was given
				}]
			};
			var oGroup = this.oView.byId("OtherGroup");

			this.sandbox.stub(ElementUtil, "getElementInstance")
				.callThrough()
				.withArgs(oGroup.getParent().getId() + "-" + mAction.items[0].id).returns({sId: "ElementExists"})
				.withArgs(oGroup.getParent().getId() + "-" + mAction.items[1].id); // element doesn't exist
			this.sandbox.stub(Log, "error");

			return AdditionalElementsAnalyzer.getCustomAddItems(oGroup, mAction)
				.then(function(aReturnValues) {
					assert.ok(ElementUtil.getElementInstance.callCount, 3, "then ElementUtil.getElementInstance called thrice for each custom item");
					assert.strictEqual(aReturnValues.length, 1, "then one custom item2 are returned");
					assert.strictEqual(aReturnValues[0].itemId, oGroup.getParent().getId() + "-" + mAction.items[1].id, "then the returned custom item has the itemId property correctly set");
					assert.strictEqual(aReturnValues[0].key, oGroup.getParent().getId() + "-" + mAction.items[1].id, "then the returned custom item has the key property correctly set");
					assert.ok(Log.error.calledWith("CustomAdd item with label " + mAction.items[2].label + " does not contain an 'id' property", "sap.ui.rta.plugin.AdditionalElementsAnalyzer#showAvailableElements"),
						"then an error was logged for the item without an id property");
				});
		});

		function getFilteredItemsListTests(aInvisibleItems, aODataItems, aInvisibleCustomItems, aUniqueCustomItems, aDelegateItems, assert) {
			var aPropertyItems = aODataItems || aDelegateItems;

			var aAnalyzerValues = [
				aInvisibleItems.concat([]),
				aPropertyItems.concat([]),
				aInvisibleCustomItems.concat(aUniqueCustomItems)
			];
			var iExpectedLength = aInvisibleItems.length + aPropertyItems.length + aUniqueCustomItems.length;
			var aExpectedValues = aInvisibleItems.concat(aPropertyItems, aUniqueCustomItems);

			var aFilteredItems = AdditionalElementsAnalyzer.getFilteredItemsList(aAnalyzerValues);

			assert.strictEqual(aFilteredItems.length, iExpectedLength, "then the filtered array has the correct length of items");
			assert.deepEqual(aFilteredItems, aExpectedValues, "then the only the invisible custom items are filtered out");
		}

		QUnit.test("when getFilteredItemsList is called with existing addODataProperty items and no delegate items, for filtering custom add items which also exist as invisible items", function(assert) {
			getFilteredItemsListTests(
				[{ elementId: "invisibleElement1" }, { elementId: "invisibleElement2" }],
				[{ property: "oDataProperty1" }],
				[{ itemId: "invisibleElement1" }, { itemId: "invisibleElement2" }],
				[{ itemId: "customItem1" }],
				[],
				assert
			);
		});

		QUnit.test("when getFilteredItemsList is called without addODataProperty items, with delegate items, for filtering custom add items which also exist as invisible items", function(assert) {
			getFilteredItemsListTests(
				[{ elementId: "invisibleElement1" }, { elementId: "invisibleElement2" }],
				[],
				[{ itemId: "invisibleElement1" }, { itemId: "invisibleElement2" }],
				[{ itemId: "customItem1" }],
				[{name: "fromDelegate"}],
				assert
			);
		});

		QUnit.test("when getFilteredItemsList is called without addODataProperty nor delegate items, for filtering custom add items which do not exist as invisible items", function(assert) {
			getFilteredItemsListTests(
				[{ elementId: "invisibleElement1" }, { elementId: "invisibleElement2" }],
				[],
				[],
				[{ itemId: "customItem1" }, { itemId: "customItem2" }],
				[],
				assert
			);
		});

		QUnit.test("when getting unbound elements for a bound table", function(assert) {
			var oTable = this.oView.byId("table");
			var mActionObject = {
				action : {},
				relevantContainer: oTable
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oTable, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 3, "then the correct amount of ODataProperties has been returned");
				assert.equal(aAdditionalElements[0].bindingPath, "EntityTypeNav_Property04");
				assert.equal(aAdditionalElements[1].bindingPath, "EntityTypeNav_Property05");
				assert.equal(aAdditionalElements[2].bindingPath, "NavProperty");
			});
		});

		QUnit.test("when getting unbound elements for bound empty table", function(assert) {
			var oTable = this.oView.byId("emptyTable");
			var mActionObject = {
				action : {},
				relevantContainer: oTable
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oTable, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 4, "then the correct amount of ODataProperties has been returned");
				assert.equal(aAdditionalElements[0].bindingPath, "id");
				assert.equal(aAdditionalElements[1].bindingPath, "EntityTypeNav_Property01");
				assert.equal(aAdditionalElements[2].bindingPath, "EntityTypeNav_Property05");
				assert.equal(aAdditionalElements[3].bindingPath, "NavProperty");
			});
		});

		QUnit.test("when getting unbound elements for the list with absolute bindings", function(assert) {
			var oList = this.oView.byId("listWithAbsoluteBinding");
			var mActionObject = {
				action : {
					aggregation: "items"
				},
				relevantContainer: oList
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oList, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 16, "then the correct amount of ODataProperties has been returned");
			});
		});

		QUnit.test("when getting unbound elements for the table with absolute bindings", function(assert) {
			var oTable = this.oView.byId("tableWithAbsoluteBinding");
			var mActionObject = {
				action : {
					aggregation: "items"
				},
				relevantContainer: oTable
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oTable, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 16, "then the correct amount of ODataProperties has been returned");
			});
		});

		QUnit.test("when getting unbound elements for table with absolute binding in a named model", function(assert) {
			var oTable = this.oView.byId("tableWithAbsoluteBinding");
			var oSomeNamedModel = new JSONModel({ foo : [1, 2]});
			oTable.setModel(oSomeNamedModel, "named");
			oTable.bindItems("named>/foo", new ColumnListItem());

			var mActionObject = {
				action : {
					aggregation: "items"
				},
				relevantContainer: oTable
			};

			return AdditionalElementsAnalyzer.getUnboundODataProperties(oTable, mActionObject).then(function(aAdditionalElements) {
				assert.equal(aAdditionalElements.length, 0, "then no ODataProperties are returned, as the scenario is not supported (but it doesn't break)");
			});
		});
	});


	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
