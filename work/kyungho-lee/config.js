const legendPrice = document.querySelector("#legend_price");

const config = {
  accessToken:
    "pk.eyJ1Ijoia2xlZTA1MTEiLCJhIjoiY2xrYnFibnNjMGV4cjNrbzRqdGg1d21sYiJ9.nN0pE1qocGhTLnD_xPuYdg",
  style: "mapbox://styles/klee0511/clptmsn3c00u201p75g0r0vyo",
  theme: "light",
  chapters: [
    {
      id: "background",
      data: "background",
      title: "more insured does not mean more care",
      image: "",
      description: `The Affordable Care Act (Obamacare) became law on March 23, 2010. In the decade before the enactment of the Affordable Care Act (ACA) in 2010, the uninsured rate averaged 15.0 percent. In 2014, provisions of the ACA went into effect that enabled states to expand Medicaid eligibility. As the ACA expanded Medicaid coverage, the uninsured rate continued to drop, falling below 9.0 percent. So, have Medicaid beneficiaries been receiving equitable treatment ever since?<br><br>
        <section class="toggle_datasets">
          <h4 class="legend_title">DataSets</h4>
          <input type="radio" class="btn-check" name="uninsured" id="uninsured_2010" autocomplete="off" checked>
          <label class="btn" for="uninsured_2010">Uninsured 2010</label>
          <input type="radio" class="btn-check" name="uninsured" id="uninsured_2022" autocomplete="off">
          <label class="btn" for="uninsured_2022">Uninsured 2022</label>
          <br>
          <input type="radio" class="btn-check" name="uninsured" id="medicaid_2010" autocomplete="off">
          <label class="btn" for="medicaid_2010">Medicaid 2010</label>
          <input type="radio" class="btn-check" name="uninsured" id="medicaid_2022" autocomplete="off">
          <label class="btn" for="medicaid_2022">Medicaid 2022</label>
        </section>

        <section id="uninsured_legend_states">
          <h4 class="legend_title">Uninsured population percentage</h4>
          <section class="legend">
            <div>
              <div><span style="background-color: #bd0026"></span>18.9 - 21.3 %</div>
              <div><span style="background-color: #e31a1c"></span>16.5 - 18.9 %</div>
              <div><span style="background-color: #fc4e2a"></span>14.0 - 16.5 %</div>
              <div><span style="background-color: #ff6d29"></span>11.6 - 14.0 %</div>
            </div>
            <div>
              <div><span style="background-color: #fd953a"></span>9.2 - 11.6 %</div>
              <div><span style="background-color: #fec34d"></span>6.8 - 9.2 %</div>
              <div><span style="background-color: #fed976"></span>4.4 - 6.8 %</div>
              <div><span style="background-color: #fff1b3"></span>Less than 4.4 %</div>
            </div>
          </section>
        </section>

        <section id="medicaid_legend_states" class="invisible">
          <h4 class="legend_title">Medicaid Enrollees percentage</h4>
          <section class="legend">
            <div>
              <div><span style="background-color: #008f32"></span>22.5 - 29.7 %</div>
              <div><span style="background-color: #459a33"></span>19.3 - 22.5 %</div>
              <div><span style="background-color: #6aa637"></span>17.0 - 19.3 %</div>
              <div><span style="background-color: #8ab03f"></span>14.9 - 17.0 %</div>
            </div>
            <div>
              <div><span style="background-color: #a9bb49"></span>11.9 - 14.9 %</div>
              <div><span style="background-color: #c6c555"></span>7.4 - 11.9 %</div>
              <div><span style="background-color: #e3cf65"></span>6.2 - 7.4 %</div>
              <div><span style="background-color: #fed976"></span>Less than 6.2 %</div>
            </div>
          </section>
        </section>
        `,
      location: {
        center: [-77.526992, 39.534694],
        zoom: 3.5,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "uninsured-percent-2010", opacity: 1.0 },
        { layer: "background-white", opacity: 1.0 },
      ],
      onChapterExit: [
        { layer: "uninsured-percent-2010", opacity: 0 },
        { layer: "uninsured-percent-2022", opacity: 0 },
        { layer: "medicaid-percent-2010", opacity: 0 },
        { layer: "medicaid-percent-2022", opacity: 0 },
      ],
    },
    {
      id: "background2",
      data: "background",
      title: "Discrimination against Medicaid has more than doubled",
      image: "",
      description: `The percentage of Medicaid enrollments in relation to the total population has increased from 13.7% to 21.7% since 2010. However, the Medicaid acceptance rate by health professionals has drastically decreased from 70.9% to 16.3% in New York State specifically. Unfortunately, the data shows that insurance-based discrimination in the healthcare system has significantly deepened since 2010.
        <section class="toggle_datasets">
          <h4 class="legend_title">DataSets</h4>
          <input type="radio" class="btn-check" name="discrimination" id="medicaid_2012" autocomplete="off" checked>
          <label class="btn" for="medicaid_2012">Medicaid 2012</label>
          <input type="radio" class="btn-check" name="discrimination" id="medicaid_2021" autocomplete="off">
          <label class="btn" for="medicaid_2021">Medicaid 2021</label>
          <br>
          <input type="radio" class="btn-check" name="discrimination" id="acceptance_2012" autocomplete="off">
          <label class="btn" for="acceptance_2012">Acceptance 2012</label>
          <input type="radio" class="btn-check" name="discrimination" id="acceptance_2021" autocomplete="off">
          <label class="btn" for="acceptance_2021">Acceptance 2021</label>
        </section>
        
        <section id="medicaid_legend_counties">
          <h4 class="legend_title">Medicaid Enrollees percentage</h4>
          <section class="legend">
            <div>
              <div><span style="background-color: #008f32"></span>37.4 - 42.0 %</div>
              <div><span style="background-color: #459a33"></span>32.9 - 37.4 %</div>
              <div><span style="background-color: #6aa637"></span>28.4 - 32.9 %</div>
              <div><span style="background-color: #8ab03f"></span>23.9 - 28.4 %</div>
            </div>
            <div>
              <div><span style="background-color: #a9bb49"></span>19.4 - 23.9 %</div>
              <div><span style="background-color: #c6c555"></span>14.9 - 19.4 %</div>
              <div><span style="background-color: #e3cf65"></span>10.4 - 14.9 %</div>
              <div><span style="background-color: #fed976"></span>5.9 - 10.4 %</div>
            </div>
          </section>
        </section>

        <section id="acceptance_legend_counties" class="invisible">
          <h4 class="legend_title">Medicaid Acceptance rate</h4>
          <section class="legend">
            <div>
              <div><span style="background-color: #bd0026"></span>11.6 - 21.8 %</div>
              <div><span style="background-color: #c9412a"></span>21.8 - 32.1 %</div>
              <div><span style="background-color: #d36434"></span>32.1 - 42.3 %</div>
              <div><span style="background-color: #dc8343"></span>42.3 - 52.6 %</div>
            </div>
            <div>
              <div><span style="background-color: #e5a059"></span>52.6 - 62.8 %</div>
              <div><span style="background-color: #edbc73"></span>62.8 - 73.1 %</div>
              <div><span style="background-color: #f5d792"></span>73.1 - 83.3 %</div>
              <div><span style="background-color: #fff1b3"></span>83.3 - 93.6 %</div>
            </div>
          </section>
        </section>        
        `,
      location: {
        center: [-72.300583, 42.901394],
        zoom: 6.1,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "medicaid-percent-counties-2012", opacity: 1.0 },
        { layer: "background-white", opacity: 0.95 },
      ],
      onChapterExit: [
        { layer: "medicaid-percent-counties-2012", opacity: 0 },
        { layer: "medicaid-percent-counties-2021", opacity: 0 },
        { layer: "medicaid-accept-counties-2012", opacity: 0 },
        { layer: "medicaid-accept-counties-2021", opacity: 0 },
      ],
    },
    {
      id: "site",
      data: "site",
      title: "healthcare disparity index to identify vulnerable areas",
      image: "",
      description: `The healthcare disparity index for Medicaid beneficiaries is derived from two datasets. The first dataset measures the number of health professionals who accept Medicaid per one hundred Medicaid enrollees. The second dataset evaluates the number of total health professionals per one hundred insured individuals. This index indicates the discrepancy in healthcare access between Medicaid enrollees and the overall insured population. Counties with a high disparity index are more susceptible to insurance-based discrimination. 
        <br /><br />
        <section class="toggle_datasets">
          <input type="radio" class="btn-check" name="metrics" id="shortage_2021" autocomplete="off" checked>
          <label class="btn" for="shortage_2021"><b>P</b></label>
          = &nbsp&nbsp Providers / 100 Insrued
          <br />
          <input type="radio" class="btn-check" name="metrics" id="shortageM_2021" autocomplete="off">
          <label class="btn" for="shortageM_2021"><b>PM</b></label>
          = &nbsp&nbsp Providers with Medicaid / 100 Medicaids 
          <br />
          <input type="radio" class="btn-check" name="metrics" id="disparity_2021" autocomplete="off">
          <label class="btn" for="disparity_2021"><b>Disparity in Medicaid</b></label>
          = &nbsp&nbsp P / PM
        </section>

        <section id="shortage_legend_counties">
          <h4 class="legend_title"></h4>
          <section class="legend">
            <div>
              <div><span style="background-color: #000094"></span>4.37 - 5.01</div>
              <div><span style="background-color: #0000d6"></span>3.73 - 4.37</div>
              <div><span style="background-color: #2424eb"></span>2.92 - 3.73</div>
              <div><span style="background-color: #4848eb"></span>2.51 - 2.92</div>
            </div>
            <div>
              <div><span style="background-color: #6c6ce9"></span>2.01 - 2.51</div>
              <div><span style="background-color: #9090eb"></span>1.46 - 2.01</div>
              <div><span style="background-color: #b4b4eb"></span>0.67 - 1.46</div>
              <div><span style="background-color: #d8d8eb"></span>0.25 - 0.67</div>
            </div>
          </section>
        </section>

        <section id="disparity_legend_counties" class="invisible">
          <h4 class="legend_title"></h4>
          <section class="legend">
            <div>
              <div><span style="background-color: #db0000"></span>3.43 - 3.74</div>
              <div><span style="background-color: #de2020"></span>3.13 - 3.43</div>
              <div><span style="background-color: #e24141"></span>2.83 - 3.13</div>
              <div><span style="background-color: #e56161"></span>2.53 - 2.83</div>
            </div>
            <div>
              <div><span style="background-color: #e98282"></span>2.23 - 2.53</div>
              <div><span style="background-color: #eca2a2"></span>1.93 - 2.23</div>
              <div><span style="background-color: #f0c3c3"></span>1.63 - 1.93</div>
              <div><span style="background-color: #f3e3e3"></span>1.33 - 1.63</div>
            </div>
          </section>
        </section>           
      `,
      location: {
        center: [-72.300583, 42.901394],
        zoom: 6.1,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "medicaid-shortage-counties-2021", opacity: 1.0 },
        { layer: "background-white", opacity: 0.95 },
      ],
      onChapterExit: [
        { layer: "medicaid-disparity-counties-2021", opacity: 0 },
        { layer: "medicaid-shortageM-counties-2021", opacity: 0 },
        { layer: "medicaid-shortage-counties-2021", opacity: 0 },
      ],
    },
    {
      id: "site2",
      data: "site",
      title: "counties with high healthcare disparity",
      image: "",
      description: `Seven counties with a high healthcare disparity index are selected and classified based on their rural status. Among these, Montgomery County is singled out for further examination to identify the most vulnerable area susceptible to insurance-based discrimination in suburban regions within New York State.
        <img src="./images/vulnerable_counties.png"/>
      `,
      location: {
        center: [-72.300583, 42.901394],
        zoom: 6.1,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "medicaid-disparity-counties-filter-2021", opacity: 1.0 },
        {
          layer: "medicaid-disparity-counties-filter-label-2021",
          opacity: 1.0,
        },
        {
          layer: "medicaid-disparity-counties-filter-line-2021",
          opacity: 1.0,
        },
        { layer: "background-white", opacity: 0.95 },
        { layer: "mapbox-satellite", opacity: 0 },
      ],
      onChapterExit: [
        { layer: "medicaid-disparity-counties-filter-2021", opacity: 0 },
        {
          layer: "medicaid-disparity-counties-filter-label-2021",
          opacity: 0,
        },
        {
          layer: "medicaid-disparity-counties-filter-line-2021",
          opacity: 0,
        },
      ],
    },
    {
      id: "site3",
      data: "site",
      title: "montgomery county",
      image: "",
      description: `
      Population : 49,532<br />
      Insured total : 28,025<br />
      Medicaid Enrollments : 7,819<br />
      Medicaid Enrollments ratio : 27.9 %<br />
      <br />
      Providers : 1,260<br />
      Providers accepting Medicaid : 149<br />
      Medicaid acceptance rate : 11.8 %<br />
      <br />
      <b>Disparity index : 2.88</b><br />
      <b>Providers / 100 Insrued : 2.62</b><br /> 
      <b>Providers with Medicaid / 100 Medicaids : 0.91</b><br /> 
      `,
      location: {
        center: [-74.153722, 42.920529],
        zoom: 9.8,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "background-white", opacity: 0.1 },
        { layer: "mapbox-satellite", opacity: 1.0 },
        {
          layer: "medicaid-disparity-counties-filter-line-dotted-2021",
          opacity: 1.0,
        },
        { layer: "areawater-montgomery", opacity: 0 },
        { layer: "montgomery-filter-outline", opacity: 0 },
      ],
      onChapterExit: [
        {
          layer: "medicaid-disparity-counties-filter-line-dotted-2021",
          opacity: 0,
        },
      ],
    },
    {
      id: "site4",
      data: "site",
      title: "filter medicaid enrollees density outliers",
      image: "",
      description: `Despite being classified as a suburban area, a significant portion of Montgomery County comprises agricultural lands. To narrow down the analysis, I filtered out census block groups with extremely low Medicaid enrollee density. Then, I grouped together adjacent census block groups to identify distinct neighbors that have sufficient Medicaid enrollees.
        <section id="disparity_legend_counties">
          <h4 class="legend_title">Medicaid Enrollments / km2</h4>
          <section class="legend">
            <div>
              <div><span style="background-color: #008f32"></span>1205 - 1962</div>
              <div><span style="background-color: #459a33"></span>783 - 1205</div>
              <div><span style="background-color: #8ab03f"></span>614 - 783</div>
              <div><span style="background-color: #8ab03f"></span>369 - 614</div>
            </div>
            <div>
              <div><span style="background-color: #a9bb49"></span>166 - 369</div>
              <div><span style="background-color: #c6c555"></span>60 - 166</div>
              <div><span style="background-color: #e3cf65"></span>20 - 50</div>
              <div><span style="background-color: #f7efc5"></span>0.37 - 20</div>
            </div>
          </section>
        </section>  
      `,
      location: {
        center: [-74.153722, 42.920529],
        zoom: 9.8,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "mapbox-satellite", opacity: 1.0 },
        { layer: "background-white", opacity: 0.5 },
        { layer: "medicaid-density-montgomery", opacity: 1 },
        { layer: "areawater-montgomery", opacity: 1 },
        { layer: "montgomery-filter-outline", opacity: 1 },
      ],
      onChapterExit: [{ layer: "medicaid-density-montgomery", opacity: 0 }],
    },
    {
      id: "site5",
      data: "site",
      title: "areas with high healthcare disparity",
      image: "",
      description: `Healthcare providers within a 5-mile radius of each identified neighbor are considered available healthcare providers for that specific neighbor. Subsequently, the downsizing process using the disparity index is reiterated at a town scale. The analysis shows that the most susceptible area within Montgomery county is St.Johnsville village. The second vulnerable area is Amsterdam city.
      <br /><br />
      <img src="./images/neighbors_buffer.png">
      <br /><br />
      <section class="toggle_datasets">
        <input type="radio" class="btn-check" name="metrics_cbg" id="montgomery-shortage" autocomplete="off" checked>
        <label class="btn" for="montgomery-shortage"><b>P</b></label>
        = &nbsp&nbsp Providers / 100 Insrued
        <br />
        <input type="radio" class="btn-check" name="metrics_cbg" id="montgomery-shortageM" autocomplete="off">
        <label class="btn" for="montgomery-shortageM"><b>PM</b></label>
        = &nbsp&nbsp Providers with Medicaid / 100 Medicaids 
        <br />
        <input type="radio" class="btn-check" name="metrics_cbg" id="montgomery-disparity" autocomplete="off">
        <label class="btn" for="montgomery-disparity"><b>Disparity in Medicaid</b></label>
        = &nbsp&nbsp P / PM
      </section>
      `,
      location: {
        center: [-74.153722, 42.920529],
        zoom: 9.8,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "mapbox-satellite", opacity: 1.0 },
        { layer: "background-white", opacity: 0.5 },
        { layer: "areawater-montgomery", opacity: 1 },
        { layer: "montgomery-cbg-outline", opacity: 1 },
        { layer: "montgomery-filter-outline", opacity: 1 },
        { layer: "montgomery-shortage", opacity: 1 },
        { layer: "montgomery-provider", opacity: 1 },
        { layer: "montgomery-provider-medicaid-big", opacity: 0 },
      ],
      onChapterExit: [
        { layer: "montgomery-cbg-outline", opacity: 0 },
        { layer: "montgomery-shortage", opacity: 0 },
        { layer: "montgomery-shortageM", opacity: 0 },
        { layer: "montgomery-disparity", opacity: 0 },
        { layer: "montgomery-provider", opacity: 0 },
        { layer: "montgomery-provider-medicaid", opacity: 0 },
      ],
    },
    {
      id: "site6",
      data: "site",
      title: "St Johnsville village",
      image: "",
      description: ` 
        Insured total : 1,167<br />
        Medicaid Enrollments : 504<br />
        Medicaid Enrollments ratio : 43.2 %<br />
        <br />
        Providers : 12<br />
        Providers accepting Medicaid : 1<br />
        Medicaid acceptance rate : 8.3 %<br />
        <br />
        <b>Disparity index : 6.36</b><br />
        <b>Providers / 100 Insrued : 1.01</b><br /> 
        <b>Providers with Medicaid / 100 Medicaids : 0.16</b><br /> 
      <br />
      <img src="./images/stjohns_health_facility.png">
      Existing healthcare facilities in the village
      `,
      location: {
        center: [-74.674895, 43.020729],
        zoom: 12.6,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "mapbox-satellite", opacity: 1.0 },
        { layer: "background-white", opacity: 0.1 },
        { layer: "areawater-montgomery", opacity: 0 },
        { layer: "montgomery-filter-outline", opacity: 1 },
        { layer: "montgomery-provider-medicaid-big", opacity: 1 },
      ],
      onChapterExit: [],
    },
    {
      id: "site7",
      data: "site",
      title: "amsterdam city",
      image: "",
      description: `
        Insured total : 14,958<br />
        Medicaid Enrollments : 6,086<br />
        Medicaid Enrollments ratio : 40.7 %<br />
        <br />
        Providers : 447<br />
        Providers accepting Medicaid : 48<br />
        Medicaid acceptance rate : 10.7 %<br />
        <br />
        <b>Disparity index : 3.79</b><br />
        <b>Providers / 100 Insrued : 2.99</b><br /> 
        <b>Providers with Medicaid / 100 Medicaids : 0.79</b><br /> 
      <br />
      <img src="./images/amsterdam_health_facility.png">
      Existing healthcare facilities in the city
      `,
      location: {
        center: [-74.163722, 42.944529],
        zoom: 13,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "mapbox-satellite", opacity: 1.0 },
        { layer: "background-white", opacity: 0.1 },
        { layer: "areawater-montgomery", opacity: 0 },
        { layer: "montgomery-filter-outline", opacity: 1 },
        { layer: "montgomery-provider-medicaid-big", opacity: 1 },
      ],
      onChapterExit: [],
    },
    {
      id: "typology",
      data: "typology",
      title: "next steps : healthcare typology",
      description: `For the next steps, I will analyze the distribution of existing healthcare facilities by service typologies (retail clinics, primary care officies, urgent care centers, freestanding emergency dapartments) to identify which healthcare typology is the most deificienty in the identified area.
        <br /><br />
        <img src="./images/healthcare_typologies.png">
      `,
      location: {
        center: [-74.163722, 42.944529],
        zoom: 13,
        pitch: 0,
        bearing: 0,
      },
      alignment: "right",
      onChapterEnter: [
        { layer: "mapbox-satellite", opacity: 1.0 },
        { layer: "background-white", opacity: 0.1 },
        { layer: "areawater-montgomery", opacity: 0 },
        { layer: "montgomery-filter-outline", opacity: 1 },
        { layer: "montgomery-provider-medicaid-big", opacity: 1 },
      ],
      onChapterExit: [],
    },
  ],
};
