import { Suspense } from "react";
import { getCars, getPage } from "../lib/queries";
import EnquiryPopupDialog from "./EnquiryPopupDialog";

export default async function EnquiryPopup() {
  const [cars, page] = await Promise.all([getCars(), getPage("contact")]);
  return (
    <Suspense>
      <EnquiryPopupDialog
        cars={cars.filter((car) => car.id).map((car) => ({ id: car.id!, slug: car.slug, name: car.name }))}
        copy={{ heading: page.formHeading, description: page.formDescription, button: page.formButton, success: page.formSuccess }}
      />
    </Suspense>
  );
}
