interface FontHelperProps
{
    text: string,
    size: number
}

const FontHelper = (props: FontHelperProps) => {
    const {text="hi", size=6} = props
  return (
    <div>
      <div className={`text-${size}xl`}>
        <div className="font-badaboom">badaboom: {text}</div>
        <div className="font-anime">anime ace: {text}</div>
        <div className="font-arsenal">arsenal: {text} {text.toUpperCase()}</div>
        <div className="font-bubblegum">bubblegum superstar: {text}</div>
        <div className="font-calaboose">calaboose: {text}</div>
        <div className="font-cooper">cooper black: {text} {text.toUpperCase()}</div>
        <div className="font-earwig">earwig factory: {text} {text.toUpperCase()}</div>
        <div className="font-gunny">gunny rewritten: {text} {text.toUpperCase()}</div>
        <div className="font-helvetica font-bold">helvetica: {text} {text.toUpperCase()}</div>
      </div>
    </div>
  )
}

export default FontHelper
