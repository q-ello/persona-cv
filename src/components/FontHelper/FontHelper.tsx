import image from '../../assets/images/image.png'

interface FontHelperProps
{
    text?: string,
    size?: number,
    imgSize?: number[],
    imgPosition?: number[],
    imgUrl?: string
}

const FontHelper = (props: FontHelperProps) => {
    const {text="hi", size=6, imgSize=[300, 100], imgPosition=[25, 75], imgUrl=image} = props
  return (
    <div>
      <div 
        className='bg-[#000000bf]'
        style={{
          fontSize: `${size}em`
        }}
      >
        <div className="font-badaboom">badaboom: {text}</div>
        <div className="font-anime">anime ace: {text}</div>
        <div className="font-arsenal">arsenal: {text} {text.toUpperCase()}</div>
        <div className="font-bubblegum">bubblegum superstar: {text}</div>
        <div className="font-calaboose">calaboose: {text}</div>
        <div className="font-casad">casad: {text} {text.toUpperCase()}</div>
        <div className="font-cooper font-black">cooper black: {text} {text.toUpperCase()}</div>
        <div className="font-cooper font-bold">cooper bold: {text} {text.toUpperCase()}</div>
        <div className="font-cooper">cooper medium: {text} {text.toUpperCase()}</div>
        <div className="font-earwig">earwig factory: {text} {text.toUpperCase()}</div>
        <div className="font-gunny">gunny rewritten: {text} {text.toUpperCase()}</div>
        <div className="font-helvetica font-bold">helvetica: {text} {text.toUpperCase()}</div>
        <div className="font-milker">milker: {text}</div>
        <div className="font-moon">moon: {text}</div>
      </div>
      <img 
        src={imgUrl} 
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
