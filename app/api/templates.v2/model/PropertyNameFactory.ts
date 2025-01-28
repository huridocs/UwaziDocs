import { PropertyTypeSchema } from 'shared/types/commonTypes';

type CreatePropertyNameProps = {
  type: PropertyTypeSchema;
  shouldGenerateRandomName?: boolean;
  label: string;
};

class PropertyNameFactory {
  private static formatValue(value: string) {
    return value
      .trim()
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
  }

  private static generateRandomName(value: string) {
    return value
      .trim()
      .replace(/[#|\\|/|*|?|"|<|>|=|||\s|:|.|[|\]|%]/gi, '_')
      .replace(/^[_|\-|+|$]/, '')
      .toLowerCase();
  }

  private static formatPropertyName(value: string, generateRandomName = false) {
    return generateRandomName ? this.generateRandomName(value) : this.formatValue(value);
  }

  static create(props: CreatePropertyNameProps) {
    const value = this.formatPropertyName(props.label, props?.shouldGenerateRandomName);

    switch (props.type) {
      case 'geolocation':
        return `${value}_geolocation`;
      case 'nested':
        return `${value}_nested`;

      default:
        return value;
    }
  }
}

export { PropertyNameFactory };
export type { CreatePropertyNameProps };
