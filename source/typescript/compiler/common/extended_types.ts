import { ExtendedType } from "../../types/hook";

const extended_types = new Map();
/**
 * Registers an extended type name and/or retrieve its type value,
 * which is an integer in the range 1<<32 - (21^2-1)<<32.
 *
 * This value can be used to replace a node's type value with the
 * custom type value while parsing, and used as reference when building
 * hooks resolvers.
 *
 * @param type_name
 * @returns
 */
export function getExtendTypeVal<T>(type_name: string, original_type: T): ExtendedType & T {
    const universal_name = type_name.toLocaleLowerCase();


    if (extended_types.has(universal_name))
        return extended_types.get(universal_name);
    else {
        const VA = (((extended_types.size + 1) * (0xFFFFFFFF + 1)));
        const VB = (+original_type);
        const VC = VA + VB;
        extended_types.set(universal_name, VC);

        return <T & ExtendedType>getExtendTypeVal(type_name, original_type);
    }
}

export function Is_Extend_Type(type: ExtendedType): type is ExtendedType {
    return (0xFFFFFFFF & type) != type;
}

export function getOriginalTypeOfExtendedType<T>(type: T & ExtendedType): T {
    return <any>(0xFFFFFFFF & +type);
}
