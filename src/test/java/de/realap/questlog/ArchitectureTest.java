package de.realap.questlog;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.GeneralCodingRules.NO_CLASSES_SHOULD_USE_FIELD_INJECTION;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** Paketstruktur nach fachlichen Bereichen, nicht nach technischen Schichten. */
// ArchUnit erkennt @ArchTest-Felder als Tests, PMD nicht.
@SuppressWarnings({"PMD.TestClassWithoutTestCases", "PMD.InstantiableUtilityClass"})
@AnalyzeClasses(
    packages = "de.realap.questlog",
    importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

  @ArchTest
  static final ArchRule FEATURE_PACKAGES_ARE_FREE_OF_CYCLES =
      slices().matching("de.realap.questlog.(*)..").should().beFreeOfCycles();

  @ArchTest
  static final ArchRule NO_TECHNICAL_LAYER_PACKAGES =
      noClasses()
          .should()
          .resideInAnyPackage(
              "..controller..",
              "..controllers..",
              "..service..",
              "..services..",
              "..repository..",
              "..repositories..",
              "..entity..",
              "..entities..",
              "..model..",
              "..dto..",
              "..util..",
              "..utils..")
          .because("Pakete schneiden nach Fachlichkeit (quest, reminder, settings, sound, ...)");

  @ArchTest static final ArchRule NO_FIELD_INJECTION = NO_CLASSES_SHOULD_USE_FIELD_INJECTION;
}
