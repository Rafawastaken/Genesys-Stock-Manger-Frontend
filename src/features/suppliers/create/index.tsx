import { useState } from "react";
import { Card } from "@/components/ui/card";
import Stepper from "./components/stepper";
import StepSupplier from "./components/step-supplier";
import StepFeed from "./components/step-feed";
import StepMapper from "./components/step-mapper";
import type { Supplier } from "@/api/suppliers";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SuppliersCreatePage() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [feedId, setFeedId] = useState<number | null>(null);

  const done = { supplier: !!supplier, feed: feedId !== null, mapper: false };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {supplier ? `Fornecedor: ${supplier.name}` : "Novo fornecedor"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Fornecedor → Feed → Mapper
            </p>
          </div>
          <Stepper step={step} done={done} />
        </div>
      </Card>

      <Card className="p-6">
        {step === 1 && (
          <StepSupplier
            onCancel={() => nav("/suppliers")}
            onNext={(sup) => {
              setSupplier(sup);
              setStep(2);
            }}
          />
        )}

        {step === 2 && supplier && (
          <StepFeed
            supplierId={supplier.id}
            onBack={() => setStep(1)}
            onNext={(id) => {
              setFeedId(id);
              setStep(3);
            }}
            onSkip={() => nav("/suppliers")}
          />
        )}

        {step === 3 && supplier && feedId !== null && (
          <StepMapper
            supplierId={supplier.id}
            feedId={feedId}
            onBack={() => setStep(2)}
            onDone={() => nav("/suppliers")}
          />
        )}
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => nav("/suppliers")}>
          Sair
        </Button>
      </div>
    </div>
  );
}
