/**
	Schema type. Handles the parsing, validation, and filtering of Model data properties. 
*/
class SchemaType {
	
	constructor(){
		this.start_value = null;
	}
	
	/**
		Parses value returns an appropriate transformed value
	*/
	parse(value){
		return value;
	}

	/**

	*/
	verify(value, result){
		result.valid = true;
	}

	filter(){
		return true;
	}

	string(value){
		return value + "";
	}
}

export {SchemaType}; 