
import Image from "next/image";
interface Props {
    dimension: number;
}
const Logo = (props: Props) => {
    return (
        <Image src={"/ParaPoLogo.png"}
            width={props.dimension}
            height={props.dimension}
            alt="Para Po! Logo"
        />
    );
};

export default Logo;