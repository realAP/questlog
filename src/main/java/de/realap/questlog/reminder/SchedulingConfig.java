package de.realap.questlog.reminder;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Schaltet den Takt ein, in dem fällige Erinnerungen verschickt werden. */
@Configuration
@EnableScheduling
class SchedulingConfig {}
