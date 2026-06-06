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
    const {text="hi", size=6, imgSize=[300, 100], imgPosition=[25, 75], imgUrl=image} = props;
    const textWithRussian = text + " лмао";
  return (
    <div>
      <div 
        className='bg-[#000000bf]'
        style={{
          fontSize: `${size}em`
        }}
      >
        <div className="font-badaboom">badaboom: {textWithRussian}</div>
        <div className="font-anime">anime ace: {textWithRussian}</div>
        <div className="font-arsenal">arsenal: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-bubblegum">bubblegum superstar: {textWithRussian}</div>
        <div className="font-calaboose">calaboose: {textWithRussian}</div>
        <div className="font-casad">casad: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-cooper font-black">cooper black: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-cooper font-bold">cooper bold: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-cooper">cooper medium: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-earwig">earwig factory: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-gunny">gunny rewritten: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-inter font-bold">inter: {textWithRussian} {textWithRussian.toUpperCase()}</div>
        <div className="font-milker">milker: {textWithRussian}</div>
        <div className="font-moon">moon: {textWithRussian}</div>
        <div className="font-gridbox">gridbox: {textWithRussian} {textWithRussian.toUpperCase()}</div>
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
