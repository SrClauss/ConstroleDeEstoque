import MenuBar from "../../Components/MenuBar/MenuBar";

export default function RootScreen({ children }) {
    return (
        <div>
            <MenuBar />
            <div>
                {children}
            </div>

        </div>
    )
}