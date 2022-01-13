const { errorColor } = require("../../styles");

const FormError = ({ text }) => {
  return <span style={{ color: errorColor }}>{text}</span>;
};

export default FormError;
