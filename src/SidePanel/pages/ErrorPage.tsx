import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Main from "../components/layout/Main";
import GenericErrorMessage from "../components/shared/error/GenericErrorMessage";

export default function ErrorPage() {
  return (
    <>
      <Header />
      <Main>
        <GenericErrorMessage />
      </Main>
      <Footer />
    </>
  )
}