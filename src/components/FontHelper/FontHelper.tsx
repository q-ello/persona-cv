import image from '../../assets/images/image.png'

interface FontHelperProps
{
    text?: string,
    size?: number,
    imgSize?: number[],
    imgPosition?: number[]
}

const FontHelper = (props: FontHelperProps) => {
    const {text="hi", size=6, imgSize=[300, 100], imgPosition=[25, 75]} = props
  return (
    <div>
      <div 
        style={{
          fontSize: `${size}em`
        }}
      >
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
      <img 
        src={image} 
        className={`object-none mx-auto`}
        style={{
          width: `${imgSize[0]}px`,
          height: `${imgSize[1]}px`,
          objectPosition: `${imgPosition[0]}% ${imgPosition[1]}%`
        }
        }
      />
    </div>
  )
}

export default FontHelper
