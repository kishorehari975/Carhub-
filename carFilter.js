import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import CAR_OBJECT from '@salesforce/schema/Wheel__c'
import CATEGORY_FIELD from '@salesforce/schema/Wheel__c.Category__c'
import MAKE_FIELD from '@salesforce/schema/Wheel__c.Make__c'

//Lightning message service and a message channel
import CARS_FILTERED_MESSAGE from '@salesforce/messageChannel/BoatMessageChannel__c'
import { publish, MessageContext } from 'lightning/messageService';
const CATEGORY_ERROR = "Error loading page"
const MAKE_ERROR = "Error loading page"
export default class CarFilter extends LightningElement {

    filters={
        searchKey:'',
        maxPrice:999999,
    }
    

    categoryError = CATEGORY_ERROR
    makeError = MAKE_ERROR

    /*Load context for LMS */
    @wire(MessageContext)
    messageContext

    
    /* fetching category picklist values*/
    //it will fetch the default recordtypeid
    @wire(getObjectInfo, {objectApiName:CAR_OBJECT})
    carObjectInfo

    @wire(getPicklistValues, {
        recordTypeId:'$carObjectInfo.data.defaultRecordTypeId',
        fieldApiName:CATEGORY_FIELD
    })categories

    // fetching make picklist values

    @wire(getPicklistValues,{
        recordTypeId:'$carObjectInfo.data.defaultRecordTypeId',
        fieldApiName:MAKE_FIELD
    })makeType
    // search key handler
    handleSearchKeyChange(event){
        console.log(event.target.value)
        this.filters={...this.filters,"searchKey":event.target.value}
        this.sendDataToCarList()
    }

    handleMaxPriceChange(event){
        console.log(event.target.value)
        this.filters={...this.filters,"maxPrice":event.target.value}
        this.sendDataToCarList()
    }
    handleCheckBox(event){
        if(!this.filters.categories){
            const categories = this.categories.data.values.map(item=>item.value)
            const makeType = this.makeType.data.values.map(item=>item.value)
            this.filters={...this.filters, categories, makeType}
        }
        const{name, value}=event.target.dataset
        if(event.target.checked){
            if(!this.filters[name].includes(value)){
                this.filters[name]=[...this.filters[name], value]
            }
            else{
                this.filters[name] = this.filters[name].filter(item=>item!==value)
            }
        }
        this.sendDataToCarList()

    }

    sendDataToCarList(){ 
            publish(this.messageContext, CARS_FILTERED_MESSAGE, {
                filters:this.filters
            })
    }
}